const { google } = require("googleapis");
const axios = require("axios");
const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");

const { filterEnrolled } = require("../helpers");
// populate first / last name columns, emails from enrolled students (google-auth)
// create gists for individual with template (inside this folder?) (axios)

const createProject = async (sheets) => {
  const configPath = path.resolve(__dirname, "../config.json");
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
    {
      message: `Please enter the name of your cohort, or press enter for your current cohort!`,
      type: "input",
      name: "cohort",
      default: config.config.cohort,
    },

  ]);
  const cohort = results.cohort.split("-")[2].toUpperCase();
  const title = `${cohort} | Project ${results.unit} Tracker`;
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
      [results.cohort]: {
        ...config.cohorts[results.cohort],
        [`project${results.unit}Tracker`]: spreadsheetId
      }
    }
  }
  fs.writeFileSync(configPath, JSON.stringify(newConfig));
  return spreadsheetId;
};

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

const createGists = async (students) => {
  const feedback = fs.readFileSync(__dirname + "/default.md", "utf8");
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
              Authorization: `token ${process.env.TOKEN}`,
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

const populateTracker = async (sheets, students, spreadsheetId) => {
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
  const gists = await createGists(enrolledStudents);
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

const createTracker = async (auth, students) => {
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = await createProject(sheets);
  await copyTemplate(sheets, spreadsheetId);
  await populateTracker(sheets, students, spreadsheetId);
};

module.exports = createTracker;
