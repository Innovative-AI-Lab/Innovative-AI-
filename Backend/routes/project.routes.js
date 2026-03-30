import { Router } from 'express';
import { body, param } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';
import { handleValidationErrors } from '../middleware/error.middleware.js';

const router = Router();

// Get all projects for the logged-in user
router.get(
    '/',
    authMiddleware.authUser,
    projectController.getAllProjects
);

// Create a new project
router.post(
    '/',
    authMiddleware.authUser,
    body('name').notEmpty().withMessage('Project name is required'),
    handleValidationErrors,
    projectController.createProject
);

// Get a single project by ID
router.get(
    '/:id',
    authMiddleware.authUser,
    param('id').isMongoId().withMessage('Invalid Project ID'),
    handleValidationErrors,
    projectController.getProjectById
);

// Update a project
router.put(
    '/:id',
    authMiddleware.authUser,
    param('id').isMongoId().withMessage('Invalid Project ID'),
    body('name').notEmpty().withMessage('Project name is required'),
    handleValidationErrors,
    projectController.updateProject
);

// Delete a project
router.delete(
    '/:id',
    authMiddleware.authUser,
    param('id').isMongoId().withMessage('Invalid Project ID'),
    handleValidationErrors,
    projectController.deleteProject
);

// Add a member to a project
router.post(
    '/:id/add-member',
    authMiddleware.authUser,
    param('id').isMongoId().withMessage('Invalid Project ID'),
    body('email').isEmail().withMessage('Valid email is required'),
    handleValidationErrors,
    projectController.addMemberToProject
);

export default router;