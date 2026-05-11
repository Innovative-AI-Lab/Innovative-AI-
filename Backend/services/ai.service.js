class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.modelName = 'gemini-flash-latest';
        this.fallbackModel = 'gemini-2.5-flash'; 
        this.baseURL = `https://generativelanguage.googleapis.com/v1beta/models`;


        
        if (!this.apiKey) {
            console.error('⚠️ GEMINI_API_KEY not found in environment variables. AI service will not be available.');
            this.apiKeyAvailable = false;
        } else {
            this.apiKeyAvailable = true;
        }
    }

    async generateResponse(prompt, context = '') {
        try {
            return await this.callWithFallback('generateResponse', prompt, context);
        } catch (error) {
            return { success: false, response: "AI service is temporarily unavailable. Please try again." };
        }
    }

    async callWithFallback(method, ...args) {
        if (!this.apiKeyAvailable) return { success: false, error: 'AI key missing' };
        
        try {
            return await this._executeCall(this.modelName, method, ...args);
        } catch (error) {
            console.warn(`Primary model ${this.modelName} failed, trying fallback ${this.fallbackModel}...`);
            try {
                return await this._executeCall(this.fallbackModel, method, ...args);
            } catch (fallbackError) {
                console.error('AI Service Error (All models failed):', fallbackError);
                throw fallbackError;
            }
        }
    }

    async _executeCall(model, method, ...args) {
        const url = `${this.baseURL}/${model}:generateContent`;
        let prompt = '';

        if (method === 'generateResponse') {
            const [userPrompt, context] = args;
            prompt = `You are a Senior Full-Stack Developer and AI Assistant. 
            Context: ${context}
            User Request: ${userPrompt}
            
            Instructions:
            - Provide accurate, technical, and helpful information.
            - Use Markdown for code blocks and formatting.
            - Keep the response concise but thorough (100-250 words).
            - If code is requested, provide runnable snippets.`;
        } else if (method === 'generateCode') {
            const [description, language] = args;
            prompt = `Generate professional, clean, and documented ${language} code for: ${description}
            
            Instructions:
            - Return ONLY the code inside a Markdown code block.
            - No preamble or explanations.
            - Follow best practices for the specified language.`;
        } else if (method === 'analyzeProject') {
            const [projectData] = args;
            prompt = `Perform a deep technical analysis of this project: ${projectData.name}. 
            
            Provide:
            1. Architecture Overview
            2. Potential Improvements
            3. Security Vulnerabilities
            4. Suggested Tech Stack additions
            
            Format as a professional technical report using Markdown. Keep it around 200 words.`;
        } else if (method === 'chatWithAI') {
            const [message, history] = args;
            prompt = `You are "Innovative AI", a premium intelligent assistant. 
            
            Context of Previous Conversation:
            ${history && history.length > 0 ? history.slice(-8).map(m => `${m.role}: ${m.content || m.text}`).join('\n') : 'No previous history.'}
            
            User Message: ${message}
            
            Instructions:
            - Be helpful, polite, and technical.
            - Use Markdown for all formatting.
            - Keep your response between 100 and 150 words.`;
        }

        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': this.apiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        if (!data || !data.candidates || !data.candidates.length || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts.length) {
            throw new Error(`Invalid response parsing: empty candidates or text`);
        }

        const text = data.candidates[0].content.parts[0].text;

        return {
            success: true,
            response: text,
            timestamp: new Date().toISOString()
        };
    }



    async generateCode(description, language = 'javascript') {
        try {
            return await this.callWithFallback('generateCode', description, language);
        } catch (error) {
            return { success: false, response: "Code generation currently unavailable." };
        }
    }

    async analyzeProject(projectData) {
        try {
            return await this.callWithFallback('analyzeProject', projectData);
        } catch (error) {
            return { success: false, response: "Project analysis failed." };
        }
    }

    async chatWithAI(message, history = []) {
        try {
            const result = await this.callWithFallback('chatWithAI', message, history);
            return {
                reply: result.response,
                message: "Response generated successfully",
                success: true
            };
        } catch (error) {
            return {
                reply: "AI service is temporarily unavailable. Please try again.",
                message: "Error occurred",
                success: false
            };
        }
    }
}

export default new AIService();