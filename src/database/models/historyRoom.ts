import mongoose from 'mongoose';

const historyRoomSchema = new mongoose.Schema({
    title: { type: String, default: null },
    chatIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "chat" }], default: [] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

export const historyRoomModel = mongoose.model<any>('historyRoom', historyRoomSchema);
