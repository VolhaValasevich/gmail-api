const fs = require('fs');
const authorize = require('./util/Authorize');
const mailFunctions = require('./util/MailFunctions');

async function main() {
    const credentials = JSON.parse(fs.readFileSync('./resources/credentials.json'));
    const auth1 = await authorize(credentials.test1);
    const text = await mailFunctions.getTextOfMostRecentEmail(auth1);
    console.log(text);
}

main();