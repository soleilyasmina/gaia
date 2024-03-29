const { google } = require("googleapis");
const axios = require("axios");
const chalk = require("chalk");
const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");

const { filterEnrolled } = require("../../services/helpers");
const provideStudents = require("../../services/students");
// populate first / last name columns, emails from enrolled students (google-auth)
// create gists for individual with template (inside this folder?) (axios)

/**
 * @func createProgress
 * @desc creates Google sheet and adds to config
 * @param {Object} sheets Google Sheets authorized interface.
 * @param {Object} config The fetched config object from `src/config/config.json`.
 * @param {String} configPath Path to write new config to.
 * @returns 
 */
const createProgress = async (sheets, config, configPath) => {
  const niceTitle = config.config.cohort.split('-')[2].toUpperCase()
  const title = `${niceTitle} | Progress Report`;
  const newSheet = await sheets.spreadsheets.create({
    resource: {
      properties: {
        title,
      },
    },
  });
  const { spreadsheetId } = newSheet.data;
  const newConfig = {
    ...config,
    cohorts: {
      ...config.cohorts,
      [config.config.cohort]: {
        ...config.cohorts[config.config.cohort],
        progressReport: spreadsheetId
      }
    }
  }
  fs.writeFileSync(configPath, JSON.stringify(newConfig));
  return spreadsheetId; 
};

/**
 * @func copyTemplate
 * @desc Copy progress template into new sheet.
 * @param {Object} sheets Google Sheets authorized interface.
 * @param {String} destinationSpreadsheetId Id of spreadsheet to copy to.
 */
const copyTemplate = async (sheets, destinationSpreadsheetId) => {
  const request = (sheetId) => ({
    spreadsheetId: "11R7Z4P_CiMyofomZyZI7N-aZhh-mE_mqC3QqIQFD4CM",
    sheetId,
    resource: {
      destinationSpreadsheetId,
    },
  });
  await sheets.spreadsheets.sheets.copyTo(request(0));
};

/**
 * @func populateTracker
 * @desc add values to tracker
 * @param {Object} sheets Google Sheets authorized interface.
 * @param {Array} students A list of all the students.
 * @param {String} spreadsheetId Id of tracker to populate.
 * @param {Object} config The fetched config object from `src/config/config.json`.
 * @param {String} cohort The current cohort.
 */
const populateTracker = async (sheets, students, spreadsheetId, config, cohort) => {
  const enrolledStudents = filterEnrolled(students);
  const extraInfo = await sheets.spreadsheets.get({
    spreadsheetId: config.cohorts[config.config.cohort].courseTracker,
    ranges: ['Course Details!I7:I8', 'Course Details!D13:D14', 'Course Details!I13:I14'],
    includeGridData: true,
  });
  const [instanceId, startDate, endDate] = extraInfo.data.sheets[0].data.map((datum) => datum.rowData[0].values[0].formattedValue);
  const today = new Date();
  const formattedToday = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  const completionColumns = enrolledStudents.map((stu, i) => ({
    majorDimension: "ROWS",
    range: `Copy of MC PR - Instructor Answers!A${i + 2}:N${i + 2}`,
    values: [[config.config.emailUser, `${stu.firstName} ${stu.lastName}`, stu.email, 'Software Engineering Immersive', startDate, endDate, "Command Line Interface, Git, JavaScript, CSS, DOM Manipulation, APIs, OOP, React, Life Cycle, Hooks, Router", "N/A", stu.absences, "Meets Expectations", "", `${config.config.name} (${config.config.pronouns.join('/')})`, formattedToday, instanceId]],
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      data: completionColumns,
      valueInputOption: "USER_ENTERED",
    },
  });
};

/**
 * @func createTracker
 * @desc Main function to create progress tracker.
 * @param {Object} auth The authorization token from `src/services/auth.js`.
 */
const createTracker = async (auth) => {
  const sheets = google.sheets({ version: "v4", auth });
  const configPath = path.resolve(__dirname, "../../config/config.json");
  const config = JSON.parse(fs.readFileSync(configPath));
  const spreadsheetId = await createProgress(sheets, config, configPath);
  const students = await provideStudents(auth);
  await copyTemplate(sheets, spreadsheetId);
  await populateTracker(sheets, students, spreadsheetId, config);
  console.log(chalk.bold.green(`Report generated for ${config.config.cohort}!`))
};

module.exports = createTracker;
