import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/database';
import logger from '../config/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  sessionId?: string;
  participantId?: string;
}

/**
 * Initialize Socket.IO event handlers for live sessions
 */
export function initializeSessionSocket(io: Server) {
  // Authentication middleware for socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        // Allow anonymous connections but mark them as such
        logger.info('Anonymous socket connection attempt');
        return next();
      }

      // Verify JWT token
      const decoded = verifyToken(token);
      socket.userId = decoded.userId;

      logger.info(`Authenticated socket connection: userId=${socket.userId}`);
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      // Still allow connection but without userId
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.id}, userId: ${socket.userId || 'anonymous'}`);

    // ========================================================================
    // JOIN SESSION
    // ========================================================================
    socket.on('join-session', async (data: {
      sessionCode: string;
      displayName?: string;
      anonymousId?: string;
    }) => {
      try {
        const { sessionCode, displayName, anonymousId } = data;

        // Find active session by code
        const session = await prisma.session.findUnique({
          where: { code: sessionCode.toUpperCase() },
          include: {
            participants: true,
          },
        });

        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        if (session.status !== 'ACTIVE') {
          socket.emit('error', { message: 'Session is not active' });
          return;
        }

        // Create or update participant
        const participantData = {
          sessionId: session.id,
          userId: socket.userId || null,
          anonymousId: socket.userId ? null : (anonymousId || socket.id),
          displayName: displayName || null,
          lastSeenAt: new Date(),
          isActive: true,
        };

        // Check if participant already exists
        const existingParticipant = await prisma.sessionParticipant.findFirst({
          where: socket.userId
            ? { sessionId: session.id, userId: socket.userId }
            : { sessionId: session.id, anonymousId: participantData.anonymousId },
        });

        let participant;
        if (existingParticipant) {
          // Update existing participant
          participant = await prisma.sessionParticipant.update({
            where: { id: existingParticipant.id },
            data: {
              lastSeenAt: new Date(),
              isActive: true,
              leftAt: null,
            },
          });
        } else {
          // Create new participant
          participant = await prisma.sessionParticipant.create({
            data: participantData,
          });
        }

        // Store participant info in socket
        socket.sessionId = session.id;
        socket.participantId = participant.id;

        // Join the socket room for this session
        socket.join(`session:${session.id}`);

        // Send session state to the participant
        socket.emit('session-joined', {
          sessionId: session.id,
          participantId: participant.id,
          currentSlideIndex: session.currentSlideIndex,
          lessonId: session.lessonId,
          participantCount: session.participants.length + 1,
        });

        // Notify other participants that someone joined
        socket.to(`session:${session.id}`).emit('participant-joined', {
          participantId: participant.id,
          displayName: participant.displayName || 'Anonymous',
          participantCount: session.participants.length + 1,
        });

        logger.info(`Participant ${participant.id} joined session ${session.id}`);
      } catch (error) {
        logger.error('Error joining session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // ========================================================================
    // ADVANCE SLIDE (Teacher only)
    // ========================================================================
    socket.on('advance-slide', async (data: {
      sessionId: string;
      slideIndex: number;
    }) => {
      try {
        const { sessionId, slideIndex } = data;

        // Verify user is the teacher of this session
        const session = await prisma.session.findUnique({
          where: { id: sessionId },
        });

        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        if (session.teacherId !== socket.userId) {
          socket.emit('error', { message: 'Only the teacher can advance slides' });
          return;
        }

        // Update session's current slide
        await prisma.session.update({
          where: { id: sessionId },
          data: {
            currentSlideIndex: slideIndex,
            lastActivityAt: new Date(),
          },
        });

        // Broadcast to all participants in the session
        io.to(`session:${sessionId}`).emit('slide-changed', {
          slideIndex,
          timestamp: new Date().toISOString(),
        });

        logger.info(`Session ${sessionId} slide advanced to ${slideIndex}`);
      } catch (error) {
        logger.error('Error advancing slide:', error);
        socket.emit('error', { message: 'Failed to advance slide' });
      }
    });

    // ========================================================================
    // UPDATE PARTICIPANT STATUS
    // ========================================================================
    socket.on('update-status', async () => {
      try {
        if (socket.participantId) {
          await prisma.sessionParticipant.update({
            where: { id: socket.participantId },
            data: { lastSeenAt: new Date() },
          });
        }
      } catch (error) {
        logger.error('Error updating participant status:', error);
      }
    });

    // ========================================================================
    // SAVE NOTE
    // ========================================================================
    socket.on('save-note', async (data: {
      sessionId: string;
      slideIndex: number;
      content: string;
    }) => {
      try {
        if (!socket.participantId) {
          socket.emit('error', { message: 'Not joined to any session' });
          return;
        }

        const { sessionId, slideIndex, content } = data;

        // Check if note already exists for this participant and slide
        const existingNote = await prisma.sessionNote.findFirst({
          where: {
            sessionId,
            participantId: socket.participantId,
            slideIndex,
          },
        });

        let note;
        if (existingNote) {
          // Update existing note
          note = await prisma.sessionNote.update({
            where: { id: existingNote.id },
            data: { content },
          });
        } else {
          // Create new note
          note = await prisma.sessionNote.create({
            data: {
              sessionId,
              participantId: socket.participantId,
              slideIndex,
              content,
            },
          });
        }

        socket.emit('note-saved', { noteId: note.id, slideIndex });
        logger.info(`Note saved for participant ${socket.participantId} on slide ${slideIndex}`);
      } catch (error) {
        logger.error('Error saving note:', error);
        socket.emit('error', { message: 'Failed to save note' });
      }
    });

    // ========================================================================
    // PAUSE/RESUME SESSION (Teacher only)
    // ========================================================================
    socket.on('pause-session', async (data: { sessionId: string }) => {
      try {
        const session = await prisma.session.findUnique({
          where: { id: data.sessionId },
        });

        if (!session || session.teacherId !== socket.userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        await prisma.session.update({
          where: { id: data.sessionId },
          data: { status: 'PAUSED' },
        });

        io.to(`session:${data.sessionId}`).emit('session-paused');
        logger.info(`Session ${data.sessionId} paused`);
      } catch (error) {
        logger.error('Error pausing session:', error);
      }
    });

    socket.on('resume-session', async (data: { sessionId: string }) => {
      try {
        const session = await prisma.session.findUnique({
          where: { id: data.sessionId },
        });

        if (!session || session.teacherId !== socket.userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        await prisma.session.update({
          where: { id: data.sessionId },
          data: { status: 'ACTIVE' },
        });

        io.to(`session:${data.sessionId}`).emit('session-resumed');
        logger.info(`Session ${data.sessionId} resumed`);
      } catch (error) {
        logger.error('Error resuming session:', error);
      }
    });

    // ========================================================================
    // END SESSION (Teacher only)
    // ========================================================================
    socket.on('end-session', async (data: { sessionId: string }) => {
      try {
        const session = await prisma.session.findUnique({
          where: { id: data.sessionId },
        });

        if (!session || session.teacherId !== socket.userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        await prisma.session.update({
          where: { id: data.sessionId },
          data: {
            status: 'ENDED',
            endedAt: new Date(),
          },
        });

        // Mark all participants as inactive
        await prisma.sessionParticipant.updateMany({
          where: { sessionId: data.sessionId },
          data: {
            isActive: false,
            leftAt: new Date(),
          },
        });

        io.to(`session:${data.sessionId}`).emit('session-ended');
        logger.info(`Session ${data.sessionId} ended`);
      } catch (error) {
        logger.error('Error ending session:', error);
      }
    });

    // ========================================================================
    // DISCONNECT
    // ========================================================================
    socket.on('disconnect', async () => {
      try {
        if (socket.participantId && socket.sessionId) {
          // Update participant status
          await prisma.sessionParticipant.update({
            where: { id: socket.participantId },
            data: {
              isActive: false,
              leftAt: new Date(),
            },
          });

          // Notify others in the session
          socket.to(`session:${socket.sessionId}`).emit('participant-left', {
            participantId: socket.participantId,
          });

          logger.info(`Participant ${socket.participantId} disconnected from session ${socket.sessionId}`);
        }
      } catch (error) {
        logger.error('Error handling disconnect:', error);
      }
    });
  });

  logger.info('✓ Session WebSocket handlers initialized');
}
