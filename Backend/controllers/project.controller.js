import mongoose from 'mongoose';
import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import { HttpError } from '../utils/httpError.util.js';
import activityService from '../services/activity.service.js';

const FAILED_TO_EXECUTE = "Failed to execute action";

/**
 * Creates a success response object.
 * @param {*} data - The data to be returned.
 * @returns {object} The success response object.
 */
const successResponse = (data) => ({
    success: true,
    data,
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res, next) => {
    try {
        const { name } = req.body;
        const ownerId = req.user._id;

        const existingProject = await Project.findOne({ name, owner: ownerId });
        if (existingProject) {
            return next(new HttpError('A project with this name already exists.', 409));
        }

        const newProject = await Project.create({
            name,
            owner: ownerId,
            users: [ownerId],
        });

        await activityService.logActivity(
            ownerId,
            'created_project',
            `Created project "${name}"`,
            { projectName: name },
            newProject._id
        );

        const populatedProject = await Project.findById(newProject._id).populate('owner', 'displayName email').populate('users', 'displayName email');

        res.status(201).json(successResponse(populatedProject));
    } catch (error) {
        next(new HttpError('Failed to create project.', 500, error.message));
    }
};

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
export const getAllProjects = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const projects = await Project.find({ users: userId }).populate('owner', 'displayName email').populate('users', 'displayName email').sort({ updatedAt: -1 });
        res.status(200).json(successResponse(projects));
    } catch (error) {
        next(new HttpError('Failed to retrieve projects.', 500, error.message));
    }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const project = await Project.findOne({ _id: id, users: userId }).populate('owner', 'displayName email').populate('users', 'displayName email');

        if (!project) {
            return next(new HttpError('Project not found or you do not have access.', 404));
        }

        res.status(200).json(successResponse(project));
    } catch (error) {
        next(new HttpError('Failed to retrieve project.', 500, error.message));
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Owner only)
export const updateProject = async (req, res, next) => {
    try {
        const { id: projectId } = req.params;
        const { name } = req.body;
        const ownerId = req.user._id;

        const project = await Project.findById(projectId);

        if (!project) {
            return next(new HttpError('Project not found.', 404));
        }

        if (project.owner.toString() !== ownerId.toString()) {
            return next(new HttpError('Only the project owner can update the project.', 403));
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { name },
            { new: true, runValidators: true }
        ).populate('owner', 'displayName email').populate('users', 'displayName email');

        if (!updatedProject) {
            return next(new HttpError(FAILED_TO_EXECUTE, 500));
        }

        await activityService.logActivity(
            ownerId,
            'updated_project',
            `Updated project name to "${name}"`,
            { newName: name },
            projectId
        );

        res.status(200).json(successResponse(updatedProject));
    } catch (error) {
        next(new HttpError('Failed to update project.', 500, error.message));
    }
};


// @desc    Add a member to a project
// @route   POST /api/projects/:id/add-member
// @access  Private (Owner only)
export const addMemberToProject = async (req, res, next) => {
    try {
        const { id: projectId } = req.params;
        const { email } = req.body;
        const ownerId = req.user._id;

        const project = await Project.findById(projectId);

        if (!project) {
            return next(new HttpError('Project not found.', 404));
        }

        if (project.owner.toString() !== ownerId.toString()) {
            return next(new HttpError('Only the project owner can add members.', 403));
        }

        const member = await User.findOne({ email });
        if (!member) {
            return next(new HttpError(`User with email "${email}" not found.`, 404));
        }

        if (project.users.includes(member._id)) {
            return next(new HttpError('User is already a member of this project.', 409));
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $addToSet: { users: member._id } },
            { new: true }
        ).populate('owner', 'displayName email').populate('users', 'displayName email');

        if (!updatedProject) {
            return next(new HttpError(FAILED_TO_EXECUTE, 500));
        }

        await activityService.logActivity(
            ownerId,
            'added_member',
            `Added ${member.displayName || member.email} to project "${project.name}"`,
            { addedUserId: member._id },
            projectId
        );

        res.status(200).json(successResponse(updatedProject));
    } catch (error) {
        next(new HttpError('Failed to add member.', 500, error.message));
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Owner only)
export const deleteProject = async (req, res, next) => {
    try {
        const { id: projectId } = req.params;
        const ownerId = req.user._id;

        const project = await Project.findById(projectId);

        if (!project) {
            return next(new HttpError('Project not found.', 404));
        }

        if (project.owner.toString() !== ownerId.toString()) {
            return next(new HttpError('Only the project owner can delete the project.', 403));
        }

        await Project.findByIdAndDelete(projectId);

        await activityService.logActivity(
            ownerId,
            'deleted_project',
            `Deleted project "${project.name}"`,
            {},
            projectId
        );

        res.status(200).json(successResponse({ projectId }));
    } catch (error) {
        next(new HttpError('Failed to delete project.', 500, error.message));
    }
};