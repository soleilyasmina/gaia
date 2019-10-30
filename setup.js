/* eslint-disable no-console */
const fs = require('fs');

require('dotenv').config();

const setup = () => {
  try {
    fs.readFileSync('credentials.json');
    console.log('Credentials found!');
    const {
      EMAILPASS, EMAILUSER, SPREADSHEETID, TOKEN,
    } = process.env;
    if (!SPREADSHEETID) {
      const noSpreadsheet = new ReferenceError();
      noSpreadsheet.code = 'NOID';
      throw noSpreadsheet;
    } else if (!EMAILUSER) {
      const noEmailUser = new ReferenceError();
      noEmailUser.code = 'NOEMAILUSER';
      throw noEmailUser;
    } else if (!EMAILPASS) {
      const noEmailPass = new ReferenceError();
      noEmailPass.code = 'NOEMAILPASS';
      throw noEmailPass;
    } else if (!TOKEN) {
      const noToken = new ReferenceError();
      noToken.code = 'NOTOKEN';
      throw noToken;
    } else {
      console.log('You\'re all ready to go!');
    }
  } catch (e) {
    switch (e.code) {
      case 'ENOENT':
        console.error('No credentials exist. Please visit https://developers.google.com/sheets/api/quickstart/nodejs#step_1_turn_on_the to generate credentials.');
        console.error('Save them in this directory as "credentials.json".');
        break;
      case 'NOID':
        console.error('No Google Sheet id detected.');
        console.error('Save it as SPREADSHEETID in this directory in your ".env" file.');
        break;
      case 'NOEMAILUSER':
        console.error('No email address detected for Mailed It!');
        console.error('Save it as EMAILUSER in this directory in your ".env" file.');
        break;
      case 'NOEMAILPASS':
        console.error('No app password detected. Please visit https://support.google.com/accounts/answer/185833?hl=en to create an app password.');
        console.error('Save it as EMAILPASS in this directory in your ".env" file.');
        break;
      case 'NOTOKEN':
        console.error('No personal access token detected. Please copy your token from Git Over Here.');
        console.error('Save it as TOKEN in this directory in your ".env" file.');
        break;
      default:
        console.error(e);
        break;
    }
  } finally {
    console.log('Thanks for using GAIA.');
  }
};

setup();
