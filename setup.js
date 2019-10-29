/* eslint-disable no-console */
const fs = require('fs');

require('dotenv').config();

const setup = () => {
  try {
    fs.readFileSync('credentials.json');
    console.log('Credentials found!');
    const { EMAILUSER, SPREADSHEETID } = process.env;
    if (!SPREADSHEETID) {
      const noSpreadsheet = new ReferenceError();
      noSpreadsheet.code = 'NOID';
      throw noSpreadsheet;
    } else if (!EMAILUSER) {

    } else {

    }
  } catch (e) {
    switch (e.code) {
      case 'ENOENT':
        console.error('No credentials exist. Please visit https://developers.google.com/sheets/api/quickstart/nodejs#step_1_turn_on_the to generate credentials.');
        console.error('Save them in this directory as "credentials.json".');
        break;
      case 'NOID':
        console.error('No Google Sheet id detected.');
        console.error('Save them in this directory in your ".env" file.');
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
