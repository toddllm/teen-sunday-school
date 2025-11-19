import express from 'express';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Bible Battle Game Routes
 *
 * TODO: Implement full Bible Battle game functionality
 * This is a stub file to allow server startup.
 * Controllers need to be implemented in ../controllers/bible-battle.controller.ts
 */

// Placeholder routes - to be implemented
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Bible Battle routes - to be implemented' });
});

export default router;
