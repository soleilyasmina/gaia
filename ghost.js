const axios = require('axios');
const fs = require('fs');
const { google } = require('googleapis');

const authorize = require('./auth');
const provideStudents = require('./index');

require('dotenv').config();

const BASE_URL = 'https://git.generalassemb.ly';

const toColumn = (num) => {
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

const parsePullRequestJSON = async (link) => {
  if (link === undefined) return [];
  const repository = link.replace(`${BASE_URL}/`, '');
  const convertedLink = `${BASE_URL}/api/v3/repos/${repository}/pulls?state=all`;
  try {
    const resp = await axios.get(convertedLink, {
      headers: {
        Authorization: `token ${process.env.TOKEN}`,
      },
    });
    const pullRequests = resp.data.map((req) => {
      const { state, user: { login } } = req;
      return { state, login };
    });
    return pullRequests;
  } catch (e) {
    console.error('Could not get pull requests.', e);
  }
};

const ghost = async (auth, columns) => {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: process.env.SPREADSHEETID,
    resource: {
      data: columns,
      valueInputOption: 'USER_ENTERED',
    },
  });
  console.log('Sheet updated!');
};

const createColumns = async (auth, students) => {
  const assignments = students[0].submissions.map((stu) => stu.link);
  const columns = await Promise.all(await assignments.map(async (assignment, index) => {
    try {
      if (assignment === undefined) return;
      const values = [];
      const pullRequests = await parsePullRequestJSON(assignment);
      students.forEach((stu) => {
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
      });
      const column = toColumn(index + 6);
      const value = {
        majorDimension: 'COLUMNS',
        range: `Homework Completion!${column}6:${column}${students.length + 6}`,
        values: [values],
      };
      return value;
    } catch (e) {
      console.error(e);
    }
  }));
  const definedColumns = columns.filter((col) => col !== undefined);
  return ghost(auth, definedColumns);
};

const updateStudents = async (students) => {
  try {
    const content = fs.readFileSync('credentials.json');
    return await authorize(JSON.parse(content), createColumns, students);
  } catch (e) {
    return console.error('Error loading client secret file:', e);
  }
};

(async () => {
  const students = await provideStudents();
  await updateStudents(students);
})();

module.exports = ghost;
