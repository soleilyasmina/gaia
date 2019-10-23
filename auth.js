const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// scope for readonly
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// where the token is saved
const TOKEN_PATH = 'token.json';

// acquiring a new token
const getNewToken = (oAuth2Client, callback, ...params) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // Node-side readline for info
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      return callback(oAuth2Client, ...params);
    });
  });
};

// to authorize and grab secret
const authorize = async (credentials, callback, ...params) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // check if a token exists
  try {
    const token = fs.readFileSync(TOKEN_PATH)
    oAuth2Client.setCredentials(JSON.parse(token));
    return await callback(oAuth2Client, ...params);
  } catch (e) {
    return getNewToken(oAuth2Client, callback, ...params);
  }
};

module.exports = authorize;
