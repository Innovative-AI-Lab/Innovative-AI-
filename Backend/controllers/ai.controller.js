import aiService from '../services/ai.service.js';

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

export const analyzeProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const projectData = req.body;
        
        if (!projectId) {
            return res.status(400).json({
                success: false,
                error: 'Project ID is required'
            });
        }

        const result = await aiService.analyzeProject({ ...projectData, id: projectId });
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};