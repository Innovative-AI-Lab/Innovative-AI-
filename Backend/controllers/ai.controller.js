import aiService from '../services/ai.service.js';
import AIResponse from '../models/aiResponse.model.js';
import activityService from '../services/activity.service.js';

export const generateResponse = async (req, res) => {
    try {
        const { prompt, context } = req.body;
        
        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required'
            });
        }

        const result = await aiService.generateResponse(prompt, context);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

export const generateCode = async (req, res) => {
    try {
        const { description, language } = req.body;
        
        if (!description) {
            return res.status(400).json({
                success: false,
                error: 'Code description is required'
            });
        }

        const result = await aiService.generateCode(description, language);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

export const saveResponse = async (req, res) => {
    try {
        const { prompt, response, projectId } = req.body;
        if (!prompt || !response) return res.status(400).json({ success: false, error: 'prompt and response required' });
        const doc = await AIResponse.create({ prompt, response, projectId: projectId || undefined, createdBy: req.user._id });
        res.status(201).json({ success: true, id: doc._id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getResponse = async (req, res) => {
    try {
        const doc = await AIResponse.findById(req.params.id).populate('createdBy', 'displayName email');
        if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: doc });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const analyzeProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const projectData = req.body;
        if (!projectId) {
            return res.status(400).json({ success: false, error: 'Project ID is required' });
        }
        const result = await aiService.analyzeProject({ ...projectData, id: projectId });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
};

export const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        const result = await aiService.chatWithAI(message, history || []);
        
        // Log activity
        await activityService.logActivity(req.user._id, 'ai_chat', `Chatted with AI: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
        
        res.status(200).json({
            success: true,
            reply: result.reply,
            message: result.message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};