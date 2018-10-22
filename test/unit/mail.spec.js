const authorize = require('../../util/Authorize');
const mailFunctions = require('../../util/MailFunctions');
const credentials = require('../../resources/credentials.json');
const chai = require('chai');
const fs = require('fs');
const expect = chai.expect;

function getRandomString() {
    return Math.random().toString(36).substring(2, 15);
}

describe('Gmail API', () => {
    let auth1, auth2, auth3, response;
    const message = {
        to: 'test2mailapi@gmail.com, test3mailapi@gmail.com',
        from: 'test1mailapi@gmail.com',
        subject: getRandomString(),
        message: getRandomString(),
        attachPath: './resources/testData/1.jpg'
    }

    before(async () => {
        auth1 = await authorize(credentials.test1);
        auth2 = await authorize(credentials.test2);
        auth3 = await authorize(credentials.test3);
        response = await mailFunctions.sendMessage(auth1, message);
    })

    it('should send a message and recieve correct status code', async () => {
        expect(response.status).to.be.eql(200);
    })

    it('should send a message and recieve correct status text', async () => {
        expect(response.statusText).to.be.eql('OK');
    })

    describe('check email contents', () => {

        before(async () => {
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

        it('should send a message with correct attachment', async () => {
            const expectedAttachment = new Buffer(fs.readFileSync(message.attachPath)).toString('base64');
            const attachment = await mailFunctions.getAttachmentsFromEmailWithSpecifiedSubject(auth2, message.subject);
            expect(attachment.replace(/\-/g, '+').replace(/\_/g, '/')).to.be.eql(expectedAttachment);
        })

        it('should move an email to another folder', async () => {
            await mailFunctions.moveEmailWithSpecifiedSubjectToAnotherFolder(auth2, message.subject, ['CATEGORY_SOCIAL'], ['CATEGORY_PERSONAL']);
            const labels = await mailFunctions.getLabelsOnEmailWithSpecifiedSubject(auth2, message.subject);
            expect(labels).to.include('CATEGORY_PERSONAL').and.to.not.include('CATEGORY_SOCIAL');
        })

        it('should delete a message with specific subject', async () => {
            await mailFunctions.deleteEmailWithSpecificSubject(auth2, message.subject);
            const result = await mailFunctions.checkIfMessageWithSpeciicSubjectIsDeleted(auth2, message.subject, 5);
            expect(result).to.be.eql('Email was successfully deleted.');
        })

        it('should be recieved by the second recipient with correct subject', async () => {
            await mailFunctions.checkMailForEmailWithSpecificSubject(auth3, message.subject, 5);
            const subject = await mailFunctions.getSubjectOfMostRecentEmail(auth3);
            expect(subject).to.be.eql(message.subject);
        })

        it('should be recieved by the second recipient with correct body', async () => {
            await mailFunctions.checkMailForEmailWithSpecificSubject(auth3, message.subject, 5);
            const text = await mailFunctions.getTextOfMostRecentEmail(auth3);
            expect(text.replace('\r\n', '')).to.be.eql(message.message);
        })
    })

    after(async () => {
        await mailFunctions.deleteAllEmails(auth2);
        await mailFunctions.deleteAllEmails(auth3);
    })
})