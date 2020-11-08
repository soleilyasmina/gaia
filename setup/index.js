const chalk = require('chalk');
const fs = require('fs');
const rl = require('readline-sync');

require('dotenv').config();

const setup = () => {
  try {
    fs.readFileSync('./setup/credentials.json');
    console.log('Credentials found!')
  } catch (e) {
    console.log('No credentials found. Open this link with your General Assembly e-mail, and enable the Google Sheets API: https://developers.google.com/sheets/api/quickstart/nodejs\n');
    console.log('After doing this, create a Desktop app via the dialog and save the file in the resulting dialog as credentials.json in the setup folder (so the path should be setup/credentials.json).\n');
  }
  const {
    COHORT, EMAILPASS, EMAILUSER, SPREADSHEETID, TOKEN,
  } = process.env;
  const env = {
    COHORT: COHORT || rl.question('Please enter the name of your cohort on Github (i.e. sei-nyc-bees).\n'),
    EMAILUSER: EMAILUSER || rl.question('\nPlease enter your General Assembly email address.\n'),
    EMAILPASS: EMAILPASS || rl.question('\nPlease enable 2-Step Verification, and place an app password for your account here.\n'),
    SPREADSHEETID: SPREADSHEETID || rl.question('\nPlease enter your Course Tracker spreadsheet id.\n'),
    TOKEN: TOKEN || rl.question('\nPlease copy in your personal access token (with gist and repo permissions) from GitHub Enterprise. You can find it here: https://git.generalassemb.ly/settings/tokens/new\n'),
  };
  const envStr = Object.entries(env).reduce((acc, [key, value]) => acc.concat(`${key}=${value}\n`), '');
  fs.writeFileSync('.env', envStr);
  console.log(`Please run ${chalk.bold.green('npm run auth')} to ensure credentials are correct.`);
};

setup();
