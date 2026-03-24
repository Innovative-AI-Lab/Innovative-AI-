class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        
        if (!this.apiKey) {
            console.error('⚠️ GEMINI_API_KEY not found in environment variables. AI service will not be available.');
            this.apiKeyAvailable = false;
        } else {
            this.apiKeyAvailable = true;
        }
    }

    async generateResponse(prompt, context = '') {
        if (!this.apiKeyAvailable) {
            return {
                success: false,
                error: 'AI service is not available. GEMINI_API_KEY is missing.',
                timestamp: new Date().toISOString()
            };
        }
        try {
            const enhancedPrompt = `You are an expert full-stack developer and programming assistant. 

User Request: "${prompt}"
Context: ${context}

Provide a complete, working solution with:
1. Full, runnable code (not just snippets)
2. Proper imports and dependencies
3. Clear comments explaining the code
4. Best practices implementation

If it's a React component, provide the complete component.
If it's a server, provide the complete server setup.
If it's CSS, provide complete styling.

Always give practical, copy-paste ready code that works immediately.`;

            const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: enhancedPrompt }] }],
                    generationConfig: { thinkingConfig: { thinkingBudget: 0 } }
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;

            return {
                success: true,
                response: text,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Gemini API Error:', error);
            return {
                success: false,
                error: 'Failed to generate response from AI service.',
                timestamp: new Date().toISOString()
            };
        }
    }

    async generateCode(description, language = 'javascript') {
        if (!this.apiKeyAvailable) {
            return {
                success: false,
                error: 'AI service is not available. GEMINI_API_KEY is missing.',
                timestamp: new Date().toISOString()
            };
        }
        try {
            const codePrompt = `Generate complete, working ${language} code for: ${description}
            
            Requirements:
            - Provide only clean, runnable code
            - Include proper comments
            - Follow best practices
            - Make it production-ready
            
            Return only the code without explanations.`;

            const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: codePrompt }] }],
                    generationConfig: { thinkingConfig: { thinkingBudget: 0 } }
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const code = data.candidates[0].content.parts[0].text;

            return {
                success: true,
                code: code,
                language,
                description,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Code Generation Error:', error);
            return {
                success: false,
                error: 'Failed to generate code',
                timestamp: new Date().toISOString()
            };
        }
    }

    async analyzeProject(projectData) {
        if (!this.apiKeyAvailable) {
            return {
                success: false,
                error: 'AI service is not available. GEMINI_API_KEY is missing.',
                timestamp: new Date().toISOString()
            };
        }
        try {
            const analysisPrompt = `Analyze this software project:
            
            Project Name: ${projectData.name || 'Unknown'}
            Project ID: ${projectData.id || 'N/A'}
            
            Please provide:
            1. Project summary
            2. Specific improvement suggestions
            3. Technology recommendations
            4. Security considerations
            5. Performance optimization tips
            
            Format as a detailed analysis report.`;

            const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: analysisPrompt }] }],
                    generationConfig: { thinkingConfig: { thinkingBudget: 0 } }
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const analysis = data.candidates[0].content.parts[0].text;

            return {
                success: true,
                analysis: analysis,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Project Analysis Error:', error);
            return {
                success: false,
                error: 'Failed to analyze project',
                timestamp: new Date().toISOString()
            };
        }
    }

    async chatWithAI(message, history = []) {
        if (!this.apiKeyAvailable) {
            return {
                reply: "I'm sorry, but the AI service is currently unavailable. Please check back later.",
                message: "AI service unavailable"
            };
        }
        try {
            // Build conversation context
            let conversationContext = "You are an intelligent AI assistant for Innovative AI, a full-stack development platform. You help developers with coding, architecture, debugging, and best practices.\n\n";
            
            if (history.length > 0) {
                conversationContext += "Previous conversation:\n";
                history.slice(-10).forEach(msg => { // Keep last 10 messages for context
                    const role = msg.role === 'user' ? 'User' : 'Assistant';
                    conversationContext += `${role}: ${msg.content || msg.text}\n`;
                });
                conversationContext += "\n";
            }
            
            conversationContext += `Current user message: ${message}\n\nProvide a helpful, accurate response. Keep it concise but comprehensive.`;

            const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: conversationContext }] }],
                    generationConfig: { thinkingConfig: { thinkingBudget: 0 } }
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.candidates[0].content.parts[0].text;

            return {
                reply: reply.trim(),
                message: "Response generated successfully"
            };
        } catch (error) {
            console.error('AI Chat Error:', error);
            return {
                reply: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
                message: "Error occurred"
            };
        }
    }
}

export default new AIService();