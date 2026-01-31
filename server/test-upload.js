// Simple test script to verify report upload endpoint
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

async function testUpload() {
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x00, 0x00, 0x00, 0x00, 0x3A, 0x7E, 0x9B,
      0x55, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
      0x54, 0x08, 0x1D, 0x01, 0x00, 0x00, 0xFF, 0xFF,
      0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x73, 0x75,
      0x01, 0x18, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
      0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const testPath = path.join(__dirname, 'test-upload.png');
    fs.writeFileSync(testPath, testImageBuffer);

    const formData = new FormData();
    formData.append('report', fs.createReadStream(testPath));

    const response = await axios.post('http://localhost:5000/api/reports/upload', formData, {
      headers: formData.getHeaders()
    });

    console.log('✅ Upload successful!');
    console.log('Response:', response.data);
    
    // Cleanup
    fs.unlinkSync(testPath);
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testUpload();
