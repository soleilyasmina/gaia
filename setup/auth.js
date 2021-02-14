/* eslint-disable no-console */
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

require("dotenv").config();

// scope for readonly
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// where the token is saved
const TOKEN_PATH = __dirname + "/token.json";

const generateOAuthClient = () => {
  const credentials = JSON.parse(fs.readFileSync(__dirname + '/credentials.json'));
  const {
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: redirectURIs,
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectURIs[0]
  );
  return oAuth2Client;
}

// acquiring a new token
const getNewToken = () => {
  const oAuth2Client = generateOAuthClient();
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // Node-side readline for info
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err1) => {
        if (err1) return console.error(err1);
        return console.log("Token stored to", TOKEN_PATH);
      });
    });
  });
};

// to authorize and grab secret
const authorize = async (callback) => {
  const oAuth2Client = generateOAuthClient();
  const token = fs.readFileSync(TOKEN_PATH);
  oAuth2Client.setCredentials(JSON.parse(token));
  return callback(oAuth2Client);
};

module.exports = {
  authorize,
  getNewToken,
};
