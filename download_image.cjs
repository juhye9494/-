const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://hyundai-cmkmagazine.org/wp-content/uploads/2026/04/%EA%B5%AC%EB%8F%85-%EC%BA%A1%EC%B3%90.png';
const targetPath = 'c:/Users/magazine/Downloads/한경 비즈니스 확장 캠페인/src/app/assets/GuideImage.ts';

https.get(url, (res) => {
  const data = [];
  res.on('data', (chunk) => {
    data.push(chunk);
  });
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    const base64 = buffer.toString('base64');
    const tsContent = `export const NAVER_GUIDE_BASE64 = "data:image/png;base64,${base64}";`;
    fs.writeFileSync(targetPath, tsContent);
    console.log('Successfully updated GuideImage.ts from URL');
  });
}).on('error', (err) => {
  console.error('Error downloading image:', err.message);
  process.exit(1);
});
