const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');

require('dotenv').config();

const setup = () => {
  try {
    fs.readFileSync('./setup/credentials.json');
    console.log('Credentials found!');
  } catch (e) {
    console.log(`No credentials found. Open this link with your General Assembly e-mail, and enable the Google Sheets API: ${chalk.blue.underline('https://developers.google.com/sheets/api/quickstart/nodejs')}\n`);
    console.log('After doing this, create a Desktop app via the dialog and save the file in the resulting dialog as credentials.json in the setup folder (so the path should be setup/credentials.json).\n');
  }
  const {
    COHORT, EMAILPASS, EMAILUSER, SPREADSHEETID, TOKEN,
  } = process.env;
  inquirer.prompt([
    {
      type: 'input',
      name: 'COHORT',
      message: 'Please enter the name of your cohort on Github (e.g. sei-nyc-bees).',
    },
    {
      type: 'input',
      name: 'EMAILUSER',
      message: 'Please enter your General Assembly e-mail address.',
    },
    {
      type: 'input',
      name: 'EMAILPASS',
      message: `Please enable 2-Step Verification, and place an app password for your account here: ${chalk.blue.underline('https://support.google.com/accounts/answer/185833?hl=en')}`,
    },
    {
      type: 'input',
      name: 'SPREADSHEETID',
      message: 'Please enter your Course Tracker spreadsheet id.',
    },
    {
      type: 'input',
      name: 'TOKEN',
      message: `Please copy in your personal access token (with gist and repo permissions) from GitHub Enterprise. You can find it here: ${chalk.blue.underline('https://git.generalassemb.ly/settings/tokens/new')}`,
    },
  ]).then((answers) => {
    const env = {
      COHORT: COHORT || answers.COHORT,
      EMAILUSER: EMAILUSER || answers.EMAILUSER,
      EMAILPASS: EMAILPASS || answers.EMAILPASS,
      SPREADSHEETID: SPREADSHEETID || answers.SPREADSHEETID,
      TOKEN: TOKEN || answers.TOKEN,
    };
    const envStr = Object.entries(env).reduce((acc, [key, value]) => acc.concat(`${key}=${value}\n`), '');
    fs.writeFileSync('.env', envStr);
    console.log(`Please run ${chalk.bold.green('npm start')} and select ${chalk.bold.green('status')} to ensure credentials are correct.`);
  });
};

module.exports = setup;
