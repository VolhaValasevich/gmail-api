const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const logger = require('./logger').logger;
const path = require('path');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://mail.google.com/'];

function authorize(credentials) {
    return new Promise((resolve, reject) => {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        const tokenPath = path.resolve('./', credentials.token_path);
        if (fs.existsSync(tokenPath)) {
            const token = fs.readFileSync(tokenPath);
            oAuth2Client.setCredentials(JSON.parse(token));
            resolve(oAuth2Client);
        } else return getNewToken(oAuth2Client, tokenPath);
    })
}

function getNewToken(oAuth2Client, tokenPath) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    logger.info(`Authorize this app by visiting this url: ${authUrl}`);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        return new Promise((resolve, reject) => {
            oAuth2Client.getToken(code, (err, token) => {
                if (err) reject(err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFileSync(tokenPath, JSON.stringify(token));
                logger.info(`Token stored to [${tokenPath}]`);
                resolve(oAuth2Client);
            });
        });
    })
}

module.exports = authorize;