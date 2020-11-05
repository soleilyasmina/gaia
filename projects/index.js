const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const rl = require('readline-sync');

const { filterEnrolled } = require('../helpers');
// populate first / last name columns, emails from enrolled students (google-auth)
// create gists for individual with template (inside this folder?) (axios)

const createProject = async (sheets) => {
  const options = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4'];
  const unit = rl.keyInSelect(options, 'Which unit is this project for?') + 1;
  if (unit === 0) return;
  const cohort = process.env.COHORT.split('-')[2].toUpperCase();
  const title = `${cohort} | Project ${unit} Tracker`;
  const newSheet = await sheets.spreadsheets.create({
    resource: {
      properties: {
        title,
      },
    },
  });
  const { spreadsheetId } = newSheet.data;
  fs.readFile('.env', 'utf8', (err, data) => {
    if (err) {
      console.log(err, 'fs error');
    } else {
      const newEnv = `${data}PROJECT_${unit}_SHEETID=${spreadsheetId}\n`;
      fs.writeFileSync('.env', newEnv);
    }
  });
  return spreadsheetId;
};

const copyTemplate = async (sheets, destinationSpreadsheetId) => {
  const request = (sheetId) => ({
    spreadsheetId: '1DEBjv4eFZ2fLxBapAuzE2QLCfY0GNwQilr9ge7tJll8',
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
  const feedback = fs.readFileSync('./projects/default.md', 'utf8');
  return Promise.all(students.map(async (stu) => {
    try {
      const baseURL = 'https://git.generalassemb.ly/api/v3/gists';
      const resp = await axios.post(baseURL, {
        description: `Project Feedback for ${stu.name}`,
        public: false,
        files: {
          'feedback.md': {
            content: feedback.replace('[NAME]', stu.name),
          },
        },
      }, {
        headers: {
          Authorization: `token ${process.env.TOKEN}`,
        },
      });
      return resp.data.html_url;
    } catch (e) {
      console.log(e);
    }
  }));
};

const populateTracker = async (sheets, students, spreadsheetId) => {
  const enrolledStudents = filterEnrolled(students);
  const approvalColumns = enrolledStudents.map((stu, i) => ({
    majorDimension: 'ROWS',
    range: `Copy of Pitch Approvals!A${i + 2}:B${i + 2}`,
    values: [[stu.firstName, stu.lastName]],
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      data: approvalColumns,
      valueInputOption: 'USER_ENTERED',
    },
  });
  const gists = await createGists(enrolledStudents);
  const completionColumns = enrolledStudents.map((stu, i) => ({
    majorDimension: 'ROWS',
    range: `Copy of Project Completions!A${i + 2}:F${i + 2}`,
    values: [[stu.firstName, stu.lastName, '', '', stu.email, gists[i]]],
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      data: completionColumns,
      valueInputOption: 'USER_ENTERED',
    },
  });
};

const createTracker = async (auth, students) => {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = await createProject(sheets);
  await copyTemplate(sheets, spreadsheetId);
  await populateTracker(sheets, students, spreadsheetId);
};

module.exports = createTracker;
