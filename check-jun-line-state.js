const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// 定義 Schema
const LineUserStateSchema = new mongoose.Schema({
    lineUserId: { type: String, required: true, unique: true },
    step: { 
        type: String, 
        enum: ['waiting_name_selection', 'name_selected', 'completed'],
        default: 'waiting_name_selection',
        required: true 
    },
    selectedName: { type: String, required: false },
    selectedTeam: { type: String, required: false },
    selectedRole: { 
        type: String, 
        enum: ['班長', '班員'],
        required: false 
    },
    lastActivity: { type: Date, default: Date.now, required: true }
}, { timestamps: true });

const UserProfileSchema = new mongoose.Schema({
    lineUserId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    pictureUrl: { type: String, required: false },
    team: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] },
    role: { type: String, required: true, enum: ['班長', '班員'] },
    memberName: { type: String, required: true },
    notificationEnabled: { type: Boolean, default: true }
}, { timestamps: true });

async function checkJunLineState() {
    try {
        console.log('🔍 檢查鈞的 LINE 狀態...\n');
        
        // 連接資料庫
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ 資料庫連接成功');
        
        // 定義模型
        const LineUserState = mongoose.models.LineUserState || mongoose.model('LineUserState', LineUserStateSchema);
        const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);
        
        // 1. 檢查 UserProfile 中的鈞
        console.log('\n1️⃣ 檢查 UserProfile 中的鈞:');
        const junProfile = await UserProfile.findOne({ memberName: '鈞' });
        
        if (junProfile) {
            console.log('   ✅ 找到鈞的 UserProfile:');
            console.log(`   - LINE User ID: ${junProfile.lineUserId}`);
            console.log(`   - 顯示名稱: ${junProfile.displayName}`);
            console.log(`   - 班級: ${junProfile.team}班`);
            console.log(`   - 角色: ${junProfile.role}`);
            console.log(`   - 通知啟用: ${junProfile.notificationEnabled}`);
        } else {
            console.log('   ❌ 未找到鈞的 UserProfile');
            return;
        }
        
        // 2. 檢查 LineUserState 中的鈞
        console.log('\n2️⃣ 檢查 LineUserState 中的鈞:');
        const junLineState = await LineUserState.findOne({ lineUserId: junProfile.lineUserId });
        
        if (junLineState) {
            console.log('   ✅ 找到鈞的 LineUserState:');
            console.log(`   - LINE User ID: ${junLineState.lineUserId}`);
            console.log(`   - 步驟: ${junLineState.step}`);
            console.log(`   - 選擇的名稱: ${junLineState.selectedName}`);
            console.log(`   - 選擇的班級: ${junLineState.selectedTeam}`);
            console.log(`   - 選擇的角色: ${junLineState.selectedRole}`);
            console.log(`   - 最後活動: ${junLineState.lastActivity}`);
        } else {
            console.log('   ❌ 未找到鈞的 LineUserState');
            console.log('   💡 這可能是問題所在！');
        }
        
        // 3. 檢查所有 LineUserState 記錄
        console.log('\n3️⃣ 檢查所有 LineUserState 記錄:');
        const allLineStates = await LineUserState.find({});
        console.log(`   總記錄數: ${allLineStates.length}`);
        
        if (allLineStates.length > 0) {
            allLineStates.forEach((state, index) => {
                console.log(`   ${index + 1}. ${state.selectedName || '未選擇'} (${state.step}) - ${state.lineUserId}`);
            });
        }
        
        // 4. 模擬通知發送邏輯
        console.log('\n4️⃣ 模擬通知發送邏輯:');
        
        // 查找符合條件的用戶
        const userProfiles = await UserProfile.find({ notificationEnabled: true });
        const lineUsers = await LineUserState.find({
            step: 'name_selected',
            selectedName: { $exists: true }
        });
        
        console.log(`   UserProfile 符合條件的用戶: ${userProfiles.length} 人`);
        console.log(`   LineUserState 符合條件的用戶: ${lineUsers.length} 人`);
        
        // 合併邏輯
        const allUsers = new Map();
        
        userProfiles.forEach(user => {
            allUsers.set(user.lineUserId, {
                lineUserId: user.lineUserId,
                name: user.memberName,
                team: user.team,
                source: 'UserProfile'
            });
        });
        
        lineUsers.forEach(user => {
            if (!allUsers.has(user.lineUserId)) {
                allUsers.set(user.lineUserId, {
                    lineUserId: user.lineUserId,
                    name: user.selectedName,
                    team: user.selectedTeam,
                    source: 'LineUserState'
                });
            }
        });
        
        console.log(`   合併後總用戶數: ${allUsers.size} 人`);
        
        const userList = Array.from(allUsers.values());
        userList.forEach(user => {
            console.log(`   - ${user.name} (${user.team}班) [來源: ${user.source}]`);
        });
        
        // 5. 檢查鈞是否會被包含在通知中
        console.log('\n5️⃣ 檢查鈞是否會被包含在通知中:');
        const junInList = userList.find(user => user.name === '鈞');
        
        if (junInList) {
            console.log('   ✅ 鈞會被包含在通知列表中');
            console.log(`   - 來源: ${junInList.source}`);
        } else {
            console.log('   ❌ 鈞不會被包含在通知列表中');
            console.log('   💡 這就是問題所在！');
            
            if (junProfile && !junLineState) {
                console.log('\n🔧 解決方案建議:');
                console.log('   鈞有 UserProfile 但沒有 LineUserState');
                console.log('   需要創建 LineUserState 記錄或修改通知邏輯');
            }
        }
        
    } catch (error) {
        console.error('❌ 檢查過程發生錯誤:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ 資料庫連接已關閉');
    }
}

checkJunLineState();
