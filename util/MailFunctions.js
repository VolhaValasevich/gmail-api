const { google } = require('googleapis');
const logger = require('./logger').logger;

class MailFunctions {

    constructor() { }

    getTextOfMostRecentEmail(auth) {
        return new Promise((resolve, reject) => {
            return this.listMessages(auth).then((messages) => {
                return this.getEmails(auth, messages).then((emails) => {
                    const buff = new Buffer(emails[0].data.payload.body.data, 'base64');
                    const text = buff.toString();
                    resolve(text);
                })
            })
        })
    }

    getSubjectOfMostRecentEmail(auth) {
        return new Promise((resolve, reject) => {
            return this.listMessages(auth).then((messages) => {
                return this.getEmails(auth, messages).then((emails) => {
                    resolve(this.getEmailSubject(emails[0]));
                })
            })
        })
    }

    listMessages(auth) {
        return new Promise((resolve, reject) => {
            const gmail = google.gmail({ version: 'v1', auth });
            let emailsArray = [];
            gmail.users.messages.list({ auth: auth, userId: 'me' }, (err, response) => {
                if (err) {
                    logger.error('The API returned an error: ' + err);
                    reject(err);
                }
                const messages = response.data.messages;
                if (messages.length) {
                    messages.forEach((message) => {
                        emailsArray.push(message);
                    })
                }
                resolve(emailsArray);
            })
        })
    }

    getEmails(auth, emailsIdList) {
        if (!emailsIdList) return [];
        let emailPromises = [];
        emailsIdList.forEach((email) => {
            emailPromises.push(new Promise((resolve, reject) => {
                let gmail = google.gmail({ version: 'v1', auth });
                gmail.users.messages.get({
                    userId: 'me',
                    id: email.id
                }, (error, response) => {
                    if (error) reject(error);
                    if (response) resolve(response);
                    else resolve();
                })
            }))
        })
        return Promise.all(emailPromises);
    }

    getEmailSubject(email) {
        let subject;
        for (let headerIndex in email.data.payload.headers) {
            if (email.data.payload.headers[headerIndex].name === 'Subject') {
                subject = email.data.payload.headers[headerIndex].value;
                break;
            }
        }
        return subject;
    }

    getEmailsWithSpecifiedSubject(emails, subject) {
        let emailsWithSpecifiedSubject = [];
        emails.forEach((email) => {
            if (this.getEmailSubject(email) === subject) emailsWithSpecifiedSubject.push(email);
        })
        return emailsWithSpecifiedSubject;
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

    getEmailsListBySubject(auth, subject) {
        return this.listMessages(auth).then((listOfEmails) => {
            return this.getEmails(auth, listOfEmails).then((emails) => {
                return this.getEmailsWithSpecifiedSubject(emails, subject);
            });
        });
    }

    checkMailForEmailWithSpecificSubject(auth, subject, checkPeriodInSeconds) {
        checkPeriodInSeconds = parseInt(checkPeriodInSeconds, 10);
        let maxNumberOfChecks = Math.floor(checkPeriodInSeconds / 3);
        let currentNumberOfChecks = 0;
        return new Promise((resolve, reject) => {
            let checkForEmail = setInterval(() => {
                currentNumberOfChecks++;
                if (currentNumberOfChecks > maxNumberOfChecks) {
                    clearInterval(checkForEmail);
                    return reject(`Email with [${subject}] subject did not appear in email inbox within ${checkPeriodInSeconds} seconds`);
                } else {
                    return this.getEmailsListBySubject(auth, subject).then((results) => {
                        if (results.length > 0) {
                            clearInterval(checkForEmail);
                            return resolve();
                        }
                    });
                }
            }, 3000);
        });
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