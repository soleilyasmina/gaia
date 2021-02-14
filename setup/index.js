const chalk = require("chalk");
const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");
const { getNewToken } = require("./auth");

require("dotenv").config();

const setup = () => {
  try {
    fs.readFileSync(__dirname + "/credentials.json");
    console.log("Credentials found!");
    const configPath = path.resolve(__dirname, "../config.json");
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(
        configPath,
        JSON.stringify({ config: {}, cohorts: {} }, null, 2)
      );
    }
    const config = JSON.parse(fs.readFileSync(configPath));
    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message:
            "Please enter your first name (how you will sign in e-mails):",
          when: () => !config.config.name,
        },
        {
          type: "checkbox",
          name: "pronouns",
          message: "Please check all pronouns you use.",
          choices: ["they/them", "she/her", "he/him"],
          default: ["they/them"],
          when: () => !config.config.pronouns
        },
        {
          type: "input",
          name: "emailUser",
          message: "Please enter your General Assembly e-mail address.",
          when: () => !config.config.emailUser,
        },
        {
          type: "input",
          name: "emailPass",
          message: `Please enable 2-Step Verification, and place an app password for your account here: ${chalk.blue.underline(
            "https://support.google.com/accounts/answer/185833?hl=en"
          )}`,
          when: () => !config.config.emailPass,
        },
        {
          type: "input",
          name: "token",
          message: `Please copy in your personal access token (with gist and repo permissions) from GitHub Enterprise. You can find it here: ${chalk.blue.underline(
            "https://git.generalassemb.ly/settings/tokens/new"
          )}`,
          when: () => !config.config.token,
        },
        {
          type: "input",
          name: "cohort",
          message:
            "Please enter the name of your cohort on Github (e.g. sei-nyc-bees).",
          when: () => !config.config.cohort,
        },
        {
          type: "input",
          name: "courseTracker",
          message: "Please enter your current Course Tracker spreadsheet id.",
          when: ({ cohort }) =>
            cohort &&
            (!config.cohorts[cohort] || !config.cohorts[cohort].courseTracker),
        },
        {
          type: "input",
          name: "curriculumRoadmap",
          message:
            "Please enter your current Curriculum roadmap's spreadsheet id.",
          when: ({ cohort }) =>
            cohort &&
            (!config.cohorts[cohort] ||
              !config.cohorts[cohort].curriculumRoadmap),
        },
      ])
      .then((answers) => {
        const newConfig = {
          ...config,
          config: {
            token: config.config.token || answers.token,
            emailUser: config.config.emailUser || answers.emailUser,
            emailPass: config.config.emailPass || answers.emailPass,
            cohort: config.config.cohort || answers.cohort,
            name: config.config.name || answers.name,
            pronouns: config.config.pronouns || answers.pronouns,
          },
          cohorts: {
            ...config.cohorts,
            [answers.cohort]: {
              courseTracker: answers.courseTracker,
              curriculumRoadmap: answers.curriculumRoadmap,
            },
          },
        };
        fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
        console.log(
          `${chalk.bold.green("config.json")} written at ${chalk.bold.green(
            configPath
          )}!`
        );
        console.log(
          `Please run ${chalk.bold.green(
            "npm start"
          )} and select ${chalk.bold.green(
            "status"
          )} to ensure credentials are correct.`
        );
        if (!fs.existsSync(__dirname + "/token.json")) {
          getNewToken();
        }
      });
  } catch (e) {
    console.log(
      `No credentials found. Open this link with your General Assembly e-mail, and enable the Google Sheets API: ${chalk.blue.underline(
        "https://developers.google.com/sheets/api/quickstart/nodejs"
      )}\n`
    );
    console.log(
      "After doing this, create a Desktop app via the dialog and save the file in the resulting dialog as credentials.json in the setup folder (so the path should be setup/credentials.json).\n"
    );
  }
};

module.exports = setup;
