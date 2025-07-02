import mongoose, { Document, Schema } from 'mongoose';

export interface ILineUserState extends Document {
    lineUserId: string;
    step: 'waiting_name_selection' | 'name_selected' | 'completed';
    selectedName?: string;
    selectedTeam?: string;
    selectedRole?: string;
    lastActivity: Date;
    createdAt: Date;
    updatedAt: Date;
}

const LineUserStateSchema = new Schema<ILineUserState>({
    lineUserId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    step: {
        type: String,
        enum: ['waiting_name_selection', 'name_selected', 'completed'],
        default: 'waiting_name_selection',
        required: true
    },
    selectedName: {
        type: String,
        required: false
    },
    selectedTeam: {
        type: String,
        required: false
    },
    selectedRole: {
        type: String,
        enum: ['班長', '班員'],
        required: false
    },
    lastActivity: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

// 創建索引以提高查詢性能
LineUserStateSchema.index({ lineUserId: 1 });
LineUserStateSchema.index({ lastActivity: 1 });

// 自動清理超過30天未活動的記錄
LineUserStateSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const LineUserState = mongoose.models.LineUserState || mongoose.model<ILineUserState>('LineUserState', LineUserStateSchema);

export default LineUserState;
