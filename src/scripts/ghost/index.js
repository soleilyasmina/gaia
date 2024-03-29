/* eslint-disable no-console */
const axios = require('axios');
const { google } = require('googleapis');
const fs = require("fs");
const path = require("path");
const provideStudents = require('../../services/students');

const BASE_URL = 'https://git.generalassemb.ly';

/**
 * @func toColumn
 * @desc Converts column index to Google Spreadsheets format.
 * @param {Number} num Index of column.
 * @returns Converted index to Google Spreadsheets column (A-ZZ)
 */
const toColumn = num => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  let counter = num;
  let column = '';
  let step = 0;
  while (counter >= 1) {
    if (counter < 27) {
      column += alphabet[counter - 1];
      break;
    }
    column = alphabet[step];
    step += 1;
    counter -= 26;
  }
  return column;
};

/**
 * @func parsePullRequestJSON
 * @desc Return completion statues and orig
 * @param {String} link The link listed in row 5 of the HW Completion sheet.
 * @param {Object} config The fetched config object from `src/config/config.json`.
 * @returns {Array} Completion statuses and GitHub usernames for each student.
 */
const parsePullRequestJSON = async (link, config) => {
  if (link === undefined) return [];
  const [organization, repository] = link
    .replace(`${BASE_URL}/`, '')
    .split('/');
  const convertedLink = `${BASE_URL}/api/v3/repos/${organization}/${repository}/pulls?state=all&per_page=100`;
  try {
    const resp = await axios.get(convertedLink, {
      headers: {
        Authorization: `token ${config.config.token}`,
      },
    });
    const pullRequests = resp.data.map((req) => {
      const {
        state,
        user: { login },
      } = req;
      return { state, login };
    });
    return pullRequests;
  } catch (e) {
    console.error('Could not get pull requests.', e);
  }
};

/**
 * @func createColumns 
 * @desc Create all columns to send to Google Spreadsheets as an update.
 * @param {Array} students A list of all the students.
 * @param {Object} config The fetched config object from `src/config/config.json`.
 * @returns {Array} All columns to send to Google Spreadsheets to update.
 */
const createColumns = async (students, config) => {
  const assignments = students[0].submissions.map((stu) => stu.link);
  const columns = await Promise.all(
    await assignments.map(async (assignment, index) => {
      try {
        if (assignment === undefined) return;
        const values = [];
        const pullRequests = await parsePullRequestJSON(assignment, config);
        students.forEach((stu) => {
          if (!stu) {
            values.push('');
          } else {
            const { username, enrollment } = stu;
            const completion = pullRequests.filter((pr) => pr.login === username);
            switch (true) {
              case enrollment === 'withdrawn':
                values.push('');
                break;
              case completion.length === 0:
                values.push('Missing');
                break;
              case completion[0].state === 'open':
                values.push('Incomplete');
                break;
              default:
                values.push('Complete');
                break;
            }
          }
        });
        const column = toColumn(index + 6);
        const value = {
          majorDimension: 'COLUMNS',
          range: `HW Completion!${column}6:${column}${students.length + 6}`,
          values: [values],
        };
        return value;
      } catch (e) {
        console.error(e);
      }
    }),
  );
  const definedColumns = columns.filter(col => col !== undefined);
  return definedColumns;
};

/**
 * @func GHOST
 * @author Soleil Solomon <soleil.solomon@generalassemb.ly>
 * @author Andre Pato <andre.pato@generalassemb.ly>
 * @author Jordan Cruz-Correa
 * @author Tran Luong
 * @desc GHOST (Get Homework Onto Spreadsheet Tool) reads in all repos listed in the assignments (with the format https://git.generalassemb.ly/<cohort>/<repo>), checks completion based on the PR being closed (complete), the PR being open (incomplete), or no PR existing at all (missing). When run with the test option, it'll inform you all columns eligible for update.
 * @param {Object} auth The authorization token from `src/services/auth.js`.
 * @param {Boolean} test Whether or not we are testing the current script.
 */
const ghost = async (auth, test) => {
  const configPath = path.resolve(__dirname, "../../config/config.json");
  const config = JSON.parse(fs.readFileSync(configPath));
  const students = await provideStudents(auth);
  const columns = await createColumns(students, config);
  const sheets = google.sheets({ version: 'v4', auth });
  if (!test) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: config.cohorts[config.config.cohort].courseTracker,
      resource: {
        data: columns,
        valueInputOption: 'USER_ENTERED',
      },
    });
    console.log('Sheet updated!');
  } else {
    console.log(`${columns.length} columns eligible for update!`);
  }
  console.log('GHOST is complete!');
};

module.exports = ghost;
