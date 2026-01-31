const fs = require('fs');
const API_URL = 'http://localhost:5000/api/auth';

async function runTest() {
    try {
        console.log('1. Registering test user...');
        const email = `debug_${Date.now()}@test.com`;

        const regRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Debug User',
                email: email,
                password: 'password123',
                phone: '1234567890'
            })
        });

        const regText = await regRes.text();
        let regData;
        try {
            regData = JSON.parse(regText);
        } catch (e) {
            console.error('Failed to parse register response');
            fs.writeFileSync('register_error.html', regText);
            throw new Error(`Register failed with status ${regRes.status}`);
        }

        if (!regRes.ok) throw new Error(JSON.stringify(regData));

        const token = regData.token;
        console.log('User registered. Token obtained.');

        console.log('2. Updating Health Profile...');
        const updateRes = await fetch(`${API_URL}/profile/health`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                chronicDisease: 'Diabetes',
                monitoringConfig: ['blood_sugar', 'insulin'],
                healthProfile: {
                    age: 45,
                    gender: 'Male',
                    base_hba1c: 6.5
                }
            })
        });

        const updateText = await updateRes.text();
        let updateData;
        try {
            updateData = JSON.parse(updateText);
        } catch (e) {
            console.error('Failed to parse update response. Saving to update_error.html');
            fs.writeFileSync('update_error.html', updateText);
            throw new Error(`Update failed with status ${updateRes.status}`);
        }

        if (updateRes.ok) {
            console.log('Update Success!', updateData);
        } else {
            console.error('Update Failed!');
            console.error('Status:', updateRes.status);
            console.error('Data:', JSON.stringify(updateData, null, 2));
        }

    } catch (error) {
        console.error('Script failed:', error);
    }
}

runTest();
