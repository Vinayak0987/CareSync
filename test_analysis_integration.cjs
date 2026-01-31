const { spawn } = require('child_process');
const path = require('path');
// const dotenv = require('dotenv');
// dotenv.config({ path: path.join(__dirname, 'server/.env') });

const pythonScript = path.join(__dirname, 'server/python_services/analyze_input.py');
// Use the E: drive file that we know exists
const testFile = 'E:\\Enigma_AntiMatter-main\\heart_disease_medical_report.pdf';

console.log('🧪 Starting Integration Test for Analysis Service...');
console.log('Script:', pythonScript);
console.log('Input:', testFile);

const pythonProcess = spawn('python', ['-u', pythonScript, testFile], {
    env: process.env // Ensure env vars like GEMINI_API_KEY are passed
});

let dataString = '';
let errorString = '';

pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
});

pythonProcess.stderr.on('data', (data) => {
    errorString += data.toString();
});

pythonProcess.on('close', (code) => {
    console.log(`\n🔹 Process exited with code ${code}`);

    // Parse logic matching server.js
    const startMarker = '__JSON_START__';
    const endMarker = '__JSON_END__';
    let jsonStr = '';
    const startIndex = dataString.indexOf(startMarker);
    const endIndex = dataString.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        jsonStr = dataString.substring(startIndex + startMarker.length, endIndex).trim();
        console.log('✅ JSON Delimiters Found');
    } else {
        console.log('❌ JSON Delimiters NOT Found');
        jsonStr = dataString.trim();
    }

    try {
        const result = JSON.parse(jsonStr);
        console.log('\n📄 Parsed Result:');
        console.log(JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('\n✅ TEST PASSED: Analysis returned success');
        } else {
            console.log('\n❌ TEST FAILED: Analysis returned error');
        }
    } catch (e) {
        console.log('\n❌ TEST FAILED: Invalid JSON output');
        console.log('Raw Stdout:', dataString);
        console.log('Stderr (debug info):', errorString);
    }
});
