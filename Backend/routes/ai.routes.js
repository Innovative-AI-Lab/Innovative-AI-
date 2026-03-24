import { Router } from 'express';
import { body } from 'express-validator';
import * as aiController from '../controllers/ai.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/generate-response',
    authMiddleware.authUser,
    body('prompt').notEmpty().withMessage('Prompt is required'),
    aiController.generateResponse
);

router.post('/generate-code',
    authMiddleware.authUser,
    body('description').notEmpty().withMessage('Code description is required'),
    aiController.generateCode
);

router.post('/analyze-project/:projectId',
    authMiddleware.authUser,
    aiController.analyzeProject
);

router.post('/save-response',
    authMiddleware.authUser,
    aiController.saveResponse
);

router.get('/response/:id', aiController.getResponse);

export default router;