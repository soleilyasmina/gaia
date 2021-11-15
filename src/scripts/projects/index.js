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
 * @func createProject
 * @desc creates Google sheet and adds to config
 * @param {Object} sheets Google Sheets authorized interface.
 * @returns {String} The spreadsheet id of the created project.
 */
const createProject = async (sheets) => {
  const configPath = path.resolve(__dirname, "../../config/config.json");
  const config = JSON.parse(fs.readFileSync(configPath));
  const results = await inquirer.prompt([
    {
      type: "list",
      choices: [
        {
          name: "Unit 1",
          value: 1,
        },
        {
          name: "Unit 2",
          value: 2,
        },
        {
          name: "Unit 3",
          value: 3,
        },
        {
          name: "Unit 4",
          value: 4,
        },
      ],
      default: 1,
      name: "unit",
      message: "What unit is this project for?",
    },
  ]);
  const shortName = config.config.cohort.split("-")[2].toUpperCase();
  const title = `${shortName} | Project ${results.unit} Tracker`;
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
        [`project${results.unit}Tracker`]: spreadsheetId,
      },
    },
  };
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
    spreadsheetId: "1DEBjv4eFZ2fLxBapAuzE2QLCfY0GNwQilr9ge7tJll8",
    sheetId,
    resource: {
      destinationSpreadsheetId,
    },
  });
  await sheets.spreadsheets.sheets.copyTo(request(1703879440));
  await sheets.spreadsheets.sheets.copyTo(request(1778259644));
  await sheets.spreadsheets.sheets.copyTo(request(1710583052));
  await sheets.spreadsheets.sheets.copyTo(request(979320693));
};

/**
 * @func createGists
 * @desc Creates a feedback gist for each student.
 * @param {Array} students A list of all the students.
 * @returns {Array} Promisifed created gists.
 */
const createGists = async (students) => {
  const feedback = fs.readFileSync(__dirname + "/default.md", "utf8");
  const configPath = path.resolve(__dirname, "../../config/config.json");
  const config = JSON.parse(fs.readFileSync(configPath));
  console.log(`Creating gists for ${chalk.bold.green(students.length)} students!`);
  return Promise.all(
    students.map(async (stu) => {
      try {
        const baseURL = "https://git.generalassemb.ly/api/v3/gists";
        const resp = await axios.post(
          baseURL,
          {
            description: `Project Feedback for ${stu.name}`,
            public: false,
            files: {
              "feedback.md": {
                content: feedback.replace("[NAME]", stu.name),
              },
            },
          },
          {
            headers: {
              Authorization: `token ${config.config.token}`,
            },
          }
        );
        return resp.data.html_url;
      } catch (e) {
        console.log(e);
      }
    })
  );
};

/**
 * @func confirmOptions
 * @desc Create object for project tracking.
 * @returns {Object} Options for creating project trackers.
 */
const confirmOptions = async () => {
  return inquirer.prompt([
    {
      type: "confirm",
      message: "Would you like to create gists?",
      name: "gists",
      default: false,
    },
  ]);
};

/**
 * @func populateTracker
 * @desc add values to tracker
 * @param {Object} sheets Google Sheets authorized interface.
 * @param {Array} students A list of all the students.
 * @param {String} spreadsheetId Id of tracker to populate.
 * @param {Object} options Options including whether or not to create gists.
 */
const populateTracker = async (sheets, students, spreadsheetId, options) => {
  const enrolledStudents = filterEnrolled(students);
  const approvalColumns = enrolledStudents.map((stu, i) => ({
    majorDimension: "ROWS",
    range: `Copy of Pitch Approvals!A${i + 2}:B${i + 2}`,
    values: [[stu.firstName, stu.lastName]],
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      data: approvalColumns,
      valueInputOption: "USER_ENTERED",
    },
  });
  const gists = options.gists
    ? await createGists(enrolledStudents)
    : new Array(enrolledStudents.length).fill("");
  const completionColumns = enrolledStudents.map((stu, i) => ({
    majorDimension: "ROWS",
    range: `Copy of Project Completions!A${i + 2}:F${i + 2}`,
    values: [[stu.firstName, stu.lastName, "", "", stu.email, gists[i]]],
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
  const spreadsheetId = await createProject(sheets);
  const destinationURL = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  console.log(`New project tracker written at ${chalk.bold.green(destinationURL)}!`);
  const students = await provideStudents(auth);
  await copyTemplate(sheets, spreadsheetId);
  const options = await confirmOptions();
  await populateTracker(sheets, students, spreadsheetId, options);
};

module.exports = createTracker;
