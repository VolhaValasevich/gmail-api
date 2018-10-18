const { google } = require('googleapis');
const fs = require('fs');
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
                    const messageRaw = response.data.payload.parts[0].body.data;;
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
}

module.exports = new MailFunctions();