const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
    console.log('🔍 測試 MongoDB 連接...');
    console.log('📍 連接字串:', process.env.MONGODB_URI ? '已設定' : '❌ 未設定');
    
    if (!process.env.MONGODB_URI) {
        console.error('❌ 錯誤: 請在 .env.local 檔案中設定 MONGODB_URI');
        process.exit(1);
    }

    try {
        // 設定連接選項
        const options = {
            serverSelectionTimeoutMS: 10000, // 10 秒超時
            socketTimeoutMS: 45000,
            family: 4, // 使用 IPv4
        };

        console.log('⏳ 正在連接到 MongoDB...');
        
        await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log('✅ MongoDB 連接成功！');
        console.log('📊 連接資訊:');
        console.log(`   - 資料庫名稱: ${mongoose.connection.db.databaseName}`);
        console.log(`   - 連接狀態: ${mongoose.connection.readyState === 1 ? '已連接' : '未連接'}`);
        console.log(`   - 主機: ${mongoose.connection.host}`);
        
        // 測試基本操作
        console.log('\n🧪 測試基本資料庫操作...');
        
        // 列出所有集合
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📁 現有集合數量: ${collections.length}`);
        
        if (collections.length > 0) {
            console.log('📋 集合列表:');
            collections.forEach(collection => {
                console.log(`   - ${collection.name}`);
            });
        }
        
        // 測試寫入操作
        const testCollection = mongoose.connection.db.collection('connection_test');
        const testDoc = {
            message: 'MongoDB Atlas 連接測試成功',
            timestamp: new Date(),
            version: '1.0'
        };
        
        await testCollection.insertOne(testDoc);
        console.log('✅ 測試文件寫入成功');
        
        // 測試讀取操作
        const retrievedDoc = await testCollection.findOne({ message: testDoc.message });
        if (retrievedDoc) {
            console.log('✅ 測試文件讀取成功');
        }
        
        // 清理測試文件
        await testCollection.deleteOne({ _id: testDoc._id });
        console.log('🧹 測試文件已清理');
        
        console.log('\n🎉 所有測試通過！MongoDB Atlas 設定完成！');
        
    } catch (error) {
        console.error('\n❌ MongoDB 連接失敗:');
        
        if (error.name === 'MongoServerSelectionError') {
            console.error('🔧 可能的解決方案:');
            console.error('   1. 檢查網路連接');
            console.error('   2. 確認 MongoDB Atlas 叢集是否正在運行');
            console.error('   3. 檢查 IP 白名單設定 (允許 0.0.0.0/0)');
            console.error('   4. 確認連接字串格式正確');
        } else if (error.name === 'MongoParseError') {
            console.error('🔧 連接字串格式錯誤:');
            console.error('   請檢查 MONGODB_URI 格式是否正確');
            console.error('   正確格式: mongodb+srv://username:password@cluster.xxxxx.mongodb.net/database?retryWrites=true&w=majority');
        } else if (error.code === 8000) {
            console.error('🔧 認證失敗:');
            console.error('   請檢查用戶名和密碼是否正確');
        }
        
        console.error('\n📝 詳細錯誤訊息:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 已斷開 MongoDB 連接');
    }
}

// 執行測試
testConnection();
