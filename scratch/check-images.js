const fs = require('fs');
const path = require('path');

function getPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.readUInt32BE(0) !== 0x89504E47) {
    throw new Error('Not a PNG file: ' + filePath);
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

try {
  const p192 = path.join(__dirname, '..', 'public', 'icon-192x192.png');
  const p512 = path.join(__dirname, '..', 'public', 'icon-512x512.png');
  
  console.log('192 png:', getPngDimensions(p192));
  console.log('512 png:', getPngDimensions(p512));
} catch (e) {
  console.error(e);
}
