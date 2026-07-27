const fs = require('fs');

const content = fs.readFileSync('data.js', 'utf8');

// Evaluate APP_DATA by creating sandbox or running in node context
const sandbox = {};
const fn = new Function('window', content);
const windowObj = {};
fn(windowObj);
const data = windowObj.APP_DATA;

function scanObject(obj, path = '') {
    if (!obj) return;
    if (typeof obj === 'string') {
        if (/[ıİ]/.test(obj)) {
            console.log(`${path}: "${obj}"`);
        }
    } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => scanObject(item, `${path}[${index}]`));
    } else if (typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
            // Ignore news content for now if request is only for pilots, teams, calendar
            scanObject(obj[key], `${path}.${key}`);
        });
    }
}

console.log('--- F1 PILOTS ---');
scanObject(data['formula 1'].pilots, 'F1.pilots');

console.log('--- F1 TEAMS ---');
scanObject(data['formula 1'].teams, 'F1.teams');

console.log('--- F1 CALENDAR ---');
scanObject(data['formula 1'].calendar, 'F1.calendar');

console.log('--- F1 STANDINGS ---');
scanObject(data['formula 1'].standings, 'F1.standings');

console.log('--- MOTOGP PILOTS ---');
scanObject(data['motogp'].pilots, 'MOTOGP.pilots');

console.log('--- MOTOGP TEAMS ---');
scanObject(data['motogp'].teams, 'MOTOGP.teams');

console.log('--- MOTOGP CALENDAR ---');
scanObject(data['motogp'].calendar, 'MOTOGP.calendar');

console.log('--- MOTOGP STANDINGS ---');
scanObject(data['motogp'].standings, 'MOTOGP.standings');
