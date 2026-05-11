import aiService from '../services/ai.service.js';
import AIResponse from '../models/aiResponse.model.js';
import activityService from '../services/activity.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

export const generateResponse = async (req, res) => {
    try {
        const { prompt, context } = req.body;
        
        if (!prompt) {
            return errorResponse(res, 'Prompt is required', 400);
        }

        const result = await aiService.generateResponse(prompt, context);
        // The service already returns a success flag and data.
        // We just pass result.response to successResponse or just the text.
        return successResponse(res, { response: result.response }, 'Response generated successfully');
    } catch (error) {
        return errorResponse(res, 'Internal server error', 500, error);
    }
};

export const generateCode = async (req, res) => {
    try {
        const { description, language } = req.body;
        
        if (!description) {
            return errorResponse(res, 'Code description is required', 400);
        }

        const result = await aiService.generateCode(description, language);
        return successResponse(res, { code: result.response }, 'Code generated successfully');
    } catch (error) {
        return errorResponse(res, 'Internal server error', 500, error);
    }
};

export const saveResponse = async (req, res) => {
    try {
        const { prompt, response, projectId } = req.body;
        if (!prompt || !response) return errorResponse(res, 'prompt and response required', 400);
        
        const doc = await AIResponse.create({ 
            prompt, 
            response, 
            projectId: projectId || undefined, 
            createdBy: req.user._id 
        });
        
        return successResponse(res, { id: doc._id }, 'Response saved successfully', 201);
    } catch (error) {
        console.error('Error saving AI response:', error);
        return errorResponse(res, 'Failed to save response in database.', 500, error);
    }
};

export const getResponse = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return errorResponse(res, 'Invalid ID format', 400);
        }

        const doc = await AIResponse.findById(id).populate('createdBy', 'displayName email');
        if (!doc) return errorResponse(res, 'Not found', 404);
        
        return successResponse(res, doc, 'Response fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

export const analyzeProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const projectData = req.body;
        if (!projectId) {
            return errorResponse(res, 'Project ID is required', 400);
        }
        const result = await aiService.analyzeProject({ ...projectData, id: projectId });
        return successResponse(res, { analysis: result.response }, 'Project analyzed successfully');
    } catch (error) {
        return errorResponse(res, 'Internal server error', 500, error);
    }
};

export const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return errorResponse(res, 'Message is required', 400);
        }

        const result = await aiService.chatWithAI(message, history || []);
        
        await activityService.logActivity(req.user._id, 'ai_chat', `Chatted with AI: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
        
        return successResponse(res, {
            reply: result.reply,
            message: result.message
        }, 'AI generated response');
    } catch (error) {
        return errorResponse(res, 'Internal server error', 500, error);
    }
};