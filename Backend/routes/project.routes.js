import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/create',
    authMiddleware.authUser,
    body('name').isString().withMessage('Name is required'),
    projectController.createProject
)

router.get('/all',
    authMiddleware.authUser,
    projectController.getAllProject
)

// router.put('/add-user',
//     authMiddleware.authUser,



//     // validate that `users` is an array of strings
//     body('users').isArray().withMessage('Users must be an array'),
//     body('users.*').isString().withMessage('Each user must be a string'),
//     // validate projectId is a non-empty string
//     body('projectId').isString().notEmpty().withMessage('projectId is required and must be a string'),
//     // inline middleware to return validation errors
//     (req, res, next) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }
//         next();
//     },

//     projectController.addUserToProject
// )


router.put('/add-user',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUserToProject
)

router.get('/get-project/:projectId',
    authMiddleware.authUser,
    projectController.getProjectById
)

export default router;