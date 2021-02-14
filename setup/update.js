const chalk = require("chalk");
const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");

require("dotenv").config();

const update = () => {
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
          name: "cohort",
          message:
            "Please enter the name of your new cohort on Github (e.g. sei-nyc-bees).",
        },
        {
          type: "input",
          name: "courseTracker",
          message: "Please enter your new Course Tracker spreadsheet id.",
        },
        {
          type: "input",
          name: "curriculumRoadmap",
          message: "Please enter your new Curriculum roadmap's spreadsheet id.",
        },
      ])
      .then((answers) => {
        const newConfig = {
          ...config,
          config: {
            ...config.config,
            cohort: answers.cohort,
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
      });
  } catch (e) {
    console.log(e.message);
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

module.exports = update;
