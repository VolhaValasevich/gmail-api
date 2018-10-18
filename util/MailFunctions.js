const { google } = require('googleapis');
const logger = require('./logger').logger;

class MailFunctions {

    constructor() { }

    getTextOfMostRecentEmail(auth) {
        const gmail = google.gmail({ version: 'v1', auth });
        return new Promise((resolve, reject) => {
            this.listMessages(auth, 1).then((messages) => {
                const messageId = messages[0].id;
                gmail.users.messages.get({ auth: auth, userId: 'me', 'id': messageId }, (err, response) => {
                    if (err) {
                        logger.error('The API returned an error: ' + err);
                        reject(err);
                    }
                    const messageRaw = response.data.payload.body.data;
                    const buff = new Buffer(messageRaw, 'base64');
                    const text = buff.toString();
                    resolve(text);
                })
            })
        })
    }

    listMessages(auth, max = 1) {
        const gmail = google.gmail({ version: 'v1', auth });
        return new Promise((resolve, reject) => {
            gmail.users.messages.list({ auth: auth, userId: 'me', maxResults: max }, (err, response) => {
                if (err) {
                    logger.error('The API returned an error: ' + err);
                    reject(err);
                }
                resolve(response.data.messages);
            })
        })
    }

    sendMessage(auth, content) {
        const gmail = google.gmail({ version: 'v1', auth });
        const message = {
            auth: auth,
            userId: 'me',
            resource: {
                raw: this.encryptMessage(content.to, content.from, content.subject, content.message)
            }
        } 
        return new Promise((resolve, reject) => {
            gmail.users.messages.send(message, (err, response) => {
                if (err) reject(err);
                resolve(response);
            });
        })
    }

    encryptMessage(to, from, subject, message) {
        const str = ['Content-Type: text/plain; charset=\"UTF-8\"\n',
            'MIME-Version: 1.0\n',
            'Content-Transfer-Encoding: 7bit\n',
            'to: ', to, '\n',
            'from: ', from, '\n',
            'subject: ', subject, '\n\n',
            message
        ].join('');
        const encodedStr = new Buffer(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
        return encodedStr;
    }
}

module.exports = new MailFunctions();