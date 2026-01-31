const fs = require('fs');
const path = require('path');
const http = require('http');

// Simple script to test file upload via HTTP to localhost:5000
// We do this manually to avoid external dependencies like axios/form-data for this test
// unless we're sure we have them. We have axios in package.json, but this is a standalone test.
// Actually, let's use the 'test_analysis_integration.cjs' approach but hitting the HTTP endpoint.

// We need to construct a multipart request.
const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const testFile = 'E:\\Enigma_AntiMatter-main\\diabetes_medical_report.pdf';

try {
    const fileContent = fs.readFileSync(testFile);

    const postDataStart = Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="report"; filename="diabetes_medical_report.pdf"\r\n` +
        `Content-Type: application/pdf\r\n\r\n`
    );

    const postDataEnd = Buffer.from(`\r\n--${boundary}--\r\n`);

    // Combine buffers
    const payload = Buffer.concat([postDataStart, fileContent, postDataEnd]);

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/upload-report',
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': payload.length
        }
    };

    console.log('📡 Testing HTTP Connection to http://localhost:5000/api/upload-report...');

    const req = http.request(options, (res) => {
        console.log(`\n🔹 Status Code: ${res.statusCode}`);
        console.log(`🔹 Headers:`, res.headers);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('\n📄 Response Body:');
            console.log(data);

            try {
                const json = JSON.parse(data);
                if (json.success && json.risks) {
                    console.log('\n✅ API TEST PASSED: Setup is correct!');
                } else {
                    console.log('\n❌ API TEST FAILED: Response logic incorrect.');
                }
            } catch (e) {
                console.log('\n❌ API TEST FAILED: Response is not JSON.');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`\n❌ API CONNECTION FAILED: ${e.message}`);
        console.log('Hints: Is the server running? Is Port 5000 blocked? Is CORS preventing localhost? (CORS is browser only usually)');
    });

    req.write(payload);
    req.end();

} catch (err) {
    console.error('Test Setup Error:', err.message);
}
