const axios = require('axios');

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

const ghost = async (students) => {
  const assignments = students[0].submissions.map((stu) => stu.link);
  const columns = [];
  await assignments.forEach(async (assignment, index) => {
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
      columns.push({
        majorDimension: 'COLUMNS',
        range: `${column}6:${column}${students.length + 6}`,
        values: [values],
      });
    } catch (e) {
      console.error(e);
    }
  });
  // implement post here
};

(async () => {
  const students = await provideStudents();
  await ghost(students);
})();

module.exports = ghost;
