const authorize = require('../../util/Authorize');
const mailFunctions = require('../../util/MailFunctions');
const credentials = require('../../resources/credentials.json');
const chai = require('chai');
const expect = chai.expect;

describe('Gmail API', () => {
    let auth1, auth2, auth3;

    before(async () => {
        auth1 = await authorize(credentials.test1);
        auth2 = await authorize(credentials.test2);
        auth3 = await authorize(credentials.test3);
    })

    it('should send an email and recieve correct status code', async () => {
        const message = {
            to: 'test2mailapi@gmail.com',
            from: 'test1mailapi@gmail.com',
            subject: 'sent by app',
            message: 'hello world'
        }
        const response = await mailFunctions.sendMessage(auth1, message);
        expect(response.status).to.be.eql(200);
    })
})