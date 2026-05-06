const fs = require('fs');
const path = require('path');

const imagePath = 'C:\\Users\\magazine\\.gemini\\antigravity\\brain\\9cc63877-e505-4e97-bbec-50973e08386a\\media__1775020067269.png';
const targetPath = 'c:/Users/magazine/Downloads/한경 비즈니스 확장 캠페인/src/app/assets/GuideImage.ts';

try {
  const bitmap = fs.readFileSync(imagePath);
  const base64 = Buffer.from(bitmap).toString('base64');
  const tsContent = `export const NAVER_GUIDE_BASE64 = "data:image/png;base64,${base64}";`;
  fs.writeFileSync(targetPath, tsContent);
  console.log('Successfully updated GuideImage.ts with new image');
} catch (err) {
  console.error(err);
  process.exit(1);
}
