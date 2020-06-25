const fs = require('fs');
const rl = require('readline-sync');

require('dotenv').config();

const update = () => {
  try {
    fs.readFileSync('credentials.json');
    console.log('Credentials found!')
  } catch (e) {
    console.log('No credentials found. Open this link with your General Assembly e-mail, and enable the Google Sheets API: https://developers.google.com/sheets/api/quickstart/nodejs');
    console.log('After doing this, save the file in the resulting dialog as credentials.json.');
  }
  const {
    EMAILPASS, EMAILUSER, TOKEN,
  } = process.env;
  const env = {
    COHORT: rl.question('Please enter the name of your cohort on Github (i.e. sei-nyc-bees).\n'),
    EMAILUSER,
    EMAILPASS,
    SPREADSHEETID: rl.question('\nPlease enter your Course Tracker spreadsheet id.\n'),
    TOKEN,
  };
  const envStr = Object.entries(env).reduce((acc, [key, value]) => acc.concat(`${key}=${value}\n`), '');
  fs.writeFileSync('.env.temp', envStr);
};

module.exports = update
