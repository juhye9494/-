const fs = require('fs');

const csvPath = 'c:/Users/magazine/Downloads/한경 비즈니스 확장 캠페인/한경매거진앤북_직원내역_배포용.csv';
const jsonPath = 'c:/Users/magazine/Downloads/한경 비즈니스 확장 캠페인/src/app/data/employees-db.json';

const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(line => line.trim());
const employees = lines.slice(1).map(line => {
    const parts = line.split(',');
    return {
        company: parts[0]?.trim() || '',
        name: parts[1]?.trim() || '',
        department: parts[2]?.trim() || '',
        position: parts[3]?.trim() || '',
        email: parts[4]?.trim() || ''
    }
});

fs.writeFileSync(jsonPath, JSON.stringify(employees, null, 2));
console.log("Converted records to JSON:", employees.length);
