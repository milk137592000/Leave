import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
    lineUserId: string;
    displayName: string;
    pictureUrl?: string;
    team: string; // A, B, C, D
    role: '班長' | '班員';
    memberName: string; // 對應 teams.ts 中的成員名稱
    notificationEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserProfileSchema: Schema = new Schema({
    lineUserId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    displayName: {
        type: String,
        required: true
    },
    pictureUrl: {
        type: String,
        required: false
    },
    team: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D']
    },
    role: {
        type: String,
        required: true,
        enum: ['班長', '班員']
    },
    memberName: {
        type: String,
        required: true
    },
    notificationEnabled: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// 創建複合索引以確保同一個成員名稱不會被多個 LINE 用戶綁定
UserProfileSchema.index({ memberName: 1 }, { unique: true });

export default mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
