import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    question: { type: String, default: null },
    answer: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

export const chatModel = mongoose.model<any>('chat', chatSchema);
