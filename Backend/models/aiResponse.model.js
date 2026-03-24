import mongoose from 'mongoose';

const aiResponseSchema = new mongoose.Schema({
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('AIResponse', aiResponseSchema);
