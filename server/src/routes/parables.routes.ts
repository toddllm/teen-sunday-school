import express from 'express';
import { authenticate, requireOrgAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Parables Routes (Plural - Collection)
 *
 * TODO: Determine if this is duplicate of parable.routes.ts or serves different purpose
 * This is a stub file to allow server startup.
 * May need to consolidate with parable.routes.ts
 */

// Placeholder routes - to be implemented
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Parables collection routes - to be implemented' });
});

export default router;
