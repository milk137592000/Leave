// 添加宇的請假記錄
const addYuLeave = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/leave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: '2025-07-02',
                name: '宇',
                team: 'A',
                period: 'fullDay'
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error:', errorData);
        } else {
            const result = await response.json();
            console.log('Success:', result);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
};

addYuLeave();
