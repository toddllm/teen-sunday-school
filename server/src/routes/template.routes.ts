import express from 'express';
import { authenticate, requireOrgAdmin } from '../middleware/auth';
import * as templateController from '../controllers/template.controller';

const router = express.Router();

// Public routes (authenticated users can view templates)
router.get('/lesson-templates', authenticate, templateController.getTemplates);
router.get('/lesson-templates/:id', authenticate, templateController.getTemplate);
router.get('/lesson-templates/stats', authenticate, templateController.getTemplateStats);

// Admin-only routes
router.post('/admin/lesson-templates', authenticate, requireOrgAdmin, templateController.createTemplate);
router.patch('/admin/lesson-templates/:id', authenticate, requireOrgAdmin, templateController.updateTemplate);
router.delete('/admin/lesson-templates/:id', authenticate, requireOrgAdmin, templateController.deleteTemplate);

// Usage tracking (authenticated users)
router.post('/lesson-templates/usage', authenticate, templateController.recordTemplateUsage);

export default router;
