const { User, Organization, Invitation } = require('../models');
const { generateToken } = require('../middleware/auth');

class AuthController {
  /**
   * Register new user with invitation token
   */
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, invitationToken } = req.validatedBody;

      // Find and validate invitation
      const invitation = await Invitation.findOne({
        where: {
          token: invitationToken,
          status: 'sent'
        },
        include: [{
          model: Organization,
          as: 'organization'
        }]
      });

      if (!invitation) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired invitation'
        });
      }

      // Check if invitation has expired
      if (new Date() > new Date(invitation.expiresAt)) {
        await invitation.update({ status: 'expired' });
        return res.status(400).json({
          success: false,
          message: 'Invitation has expired'
        });
      }

      // Check if email matches invitation
      if (email.toLowerCase() !== invitation.email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'Email does not match invitation'
        });
      }

      // Check if user already exists
      let user = await User.findOne({
        where: {
          email: email.toLowerCase(),
          organizationId: invitation.organizationId
        }
      });

      if (user && user.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'User already registered'
        });
      }

      // Update existing user or create new one
      if (user) {
        await user.update({
          password,
          firstName,
          lastName,
          status: 'active',
          emailVerifiedAt: new Date()
        });
      } else {
        user = await User.create({
          organizationId: invitation.organizationId,
          email: email.toLowerCase(),
          password,
          firstName,
          lastName,
          role: invitation.role,
          group: invitation.group,
          status: 'active',
          emailVerifiedAt: new Date()
        });
      }

      // Update invitation
      await invitation.update({
        status: 'accepted',
        acceptedAt: new Date(),
        userId: user.id
      });

      // Generate token
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user,
          token,
          organization: invitation.organization
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.validatedBody;

      const user = await User.findOne({
        where: { email: email.toLowerCase() },
        include: [{
          model: Organization,
          as: 'organization'
        }]
      });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is not active'
        });
      }

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      // Generate token
      const token = generateToken(user.id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token,
          organization: user.organization
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        include: [{
          model: Organization,
          as: 'organization'
        }]
      });

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: error.message
      });
    }
  }

  /**
   * Validate invitation token
   */
  async validateInvitation(req, res) {
    try {
      const { token } = req.params;

      const invitation = await Invitation.findOne({
        where: { token },
        include: [{
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'slug']
        }]
      });

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: 'Invitation not found'
        });
      }

      const now = new Date();
      const isExpired = now > new Date(invitation.expiresAt);
      const isValid = invitation.status === 'sent' && !isExpired;

      if (isExpired && invitation.status === 'sent') {
        await invitation.update({ status: 'expired' });
      }

      res.json({
        success: true,
        data: {
          valid: isValid,
          invitation: {
            email: invitation.email,
            firstName: invitation.firstName,
            lastName: invitation.lastName,
            role: invitation.role,
            organization: invitation.organization,
            expiresAt: invitation.expiresAt,
            status: isExpired ? 'expired' : invitation.status
          }
        }
      });
    } catch (error) {
      console.error('Validate invitation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate invitation',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
