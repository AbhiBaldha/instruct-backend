import mongoose from 'mongoose';

const userSchema: any = new mongoose.Schema({
    name: { type: String, default: null },
    userName: { type: String, default: null },
    email: { type: String, default: null },
    loginType: { type: Number, default: 0, enum: [0, 1, 2, 3] }, // 0 - regular || 1 - google 
    userType: { type: Number, default: 0, enum: [0, 1, 2] }, // 0 - user || 1 - admin  
    password: { type: String, default: null },
    profileImage: { type: String, default: "https://www.pngitem.com/pimgs/m/78-786293_1240-x-1240-0-avatar-profile-icon-png.png" },
    aboutMe: { type: String, default: null },
    otp: { type: Number, default: null },
    otpExpireTime: { type: Date, default: null },
    deviceToken: { type: [{ type: String }], default: [] },
    isEmailVerified: { type: Boolean, default: false },
    isBlock: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

export const userModel = mongoose.model<any>('user', userSchema);

