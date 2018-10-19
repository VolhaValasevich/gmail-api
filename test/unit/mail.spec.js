const authorize = require('../../util/Authorize');
const mailFunctions = require('../../util/MailFunctions');
const credentials = require('../../resources/credentials.json');
const chai = require('chai');
const expect = chai.expect;

function getRandomString() {
    return Math.random().toString(36).substring(2, 15);
}

describe('Gmail API', () => {
    let auth1, auth2, auth3, response;
    const message = {
        to: 'test2mailapi@gmail.com',
        from: 'test1mailapi@gmail.com',
        subject: getRandomString(),
        message: getRandomString(),
        //attachPath: './resources/testData/1.jpg'
    }

    before(async () => {
        auth1 = await authorize(credentials.test1);
        auth2 = await authorize(credentials.test2);
        response = await mailFunctions.sendMessage(auth1, message);
    })

    it('should send a message and recieve correct status code', async () => {
        expect(response.status).to.be.eql(200);
    })

    it('should send a message and recieve correct status text', async () => {
        expect(response.statusText).to.be.eql('OK');
    })

    describe('check email contents', () => {

        before(async() => {
            await mailFunctions.checkMailForEmailWithSpecificSubject(auth2, message.subject, 5);
        })

        it('should send a message with specific text', async () => {
            const text = await mailFunctions.getTextOfMostRecentEmail(auth2);
            expect(text.replace('\r\n', '')).to.be.eql(message.message);
        })

        it('should send a message with specific subject', async () => {
            const subject = await mailFunctions.getSubjectOfMostRecentEmail(auth2);
            expect(subject).to.be.eql(message.subject);
        })

        it('should delete a message with specific subject', async() => {
            await mailFunctions.deleteEmailWithSpecificSubject(auth2, message.subject);
            const result = await mailFunctions.checkIfMessageWithSpeciicSubjectIsDeleted(auth2, message.subject, 5);
            expect(result).to.be.eql('Email was successfully deleted.');
        })
    })

    after(async() => {
        await mailFunctions.deleteAllEmails(auth2);
    })
})