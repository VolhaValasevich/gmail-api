const fs = require('fs');
const authorize = require('./util/Authorize');
const mailFunctions = require('./util/MailFunctions');

async function main() {
    const credentials = JSON.parse(fs.readFileSync('./resources/credentials.json'));
    const auth1 = await authorize(credentials.test1);
    const message = {
        to: 'test2mailapi@gmail.com',
        from: 'test1mailapi@gmail.com',
        subject: 'sent by app',
        message: 'hello world'
    }
    mailFunctions.sendMessage(auth1, message).then((text) => {
        console.log(text);
    }).catch((err) => {
        console.error(err);
    })

}

main();