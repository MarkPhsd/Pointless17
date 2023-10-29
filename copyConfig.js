const fs = require('fs');
const path = require('path');

const domain = process.env.DOMAIN || 'default';
// const domain = process.argv[2] || 'default';
const srcPath = path.join(__dirname, 'fbconfigs', `${domain}.json`);
const destPath = path.join(__dirname, 'dist', 'CCSAPP', 'assets', 'app-config.json');

// console.log('Environment variable DOMAIN:', process.env.DOMAIN);
// console.log('Command line arguments:', process.argv);

if (fs.existsSync(srcPath)) {
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${srcPath} to ${destPath}`);
} else {
  console.error(`Configuration file for domain ${domain} does not exist.`);
}
