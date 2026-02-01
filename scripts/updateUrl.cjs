const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../server/.env');
const newUrl = process.argv[2];

if (!newUrl) {
    console.error('Please provide the new URL as an argument.');
    console.error('Usage: node scripts/updateUrl.cjs https://your-url.com');
    process.exit(1);
}

try {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Regex to replace BASE_URL
    if (envContent.match(/^BASE_URL=.*$/m)) {
        envContent = envContent.replace(/^BASE_URL=.*$/m, `BASE_URL=${newUrl}`);
    } else {
        envContent += `\nBASE_URL=${newUrl}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated BASE_URL to: ${newUrl}`);

} catch (error) {
    console.error('Error updating .env:', error);
}
