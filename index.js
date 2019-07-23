const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

require('dotenv').config();

// scope for readonly
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const TOKEN_PATH = 'token.json';

const getNewToken = (oAuth2Client, callback) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // Node side readline for info
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
};

const authorize = async (credentials, callback) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // check if a token exists
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
};

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAILUSER,
    pass: process.env.EMAILPASS,
  },
});

const sendMailTo = (email, text) => {
  transport.sendMail({
    from: process.env.EMAILUSER,
    to: email,
    subject: 'Homework / Absence Status',
    text,
  }, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
};

const listHomework = async (auth) => {
  const sheets = google.sheets({ version: 'v4', auth });
  // grab lots of data
  const studentsData = await sheets.spreadsheets.values.get({
    spreadsheetId: '1gT1ZYt2dGpnhUxG3M83lMLcX6jm9OJzM5NZX4pn_ex8',
    range: 'Homework Completion!B6:E20',
  });
  const assignmentsData = await sheets.spreadsheets.values.get({
    spreadsheetId: '1gT1ZYt2dGpnhUxG3M83lMLcX6jm9OJzM5NZX4pn_ex8',
    range: 'Homework Completion!F5:BC5',
  });
  const submissionsData = await sheets.spreadsheets.values.get({
    spreadsheetId: '1gT1ZYt2dGpnhUxG3M83lMLcX6jm9OJzM5NZX4pn_ex8',
    range: 'Homework Completion!F6:BC20',
  });
  const attendancesData = await sheets.spreadsheets.values.get({
    spreadsheetId: '1gT1ZYt2dGpnhUxG3M83lMLcX6jm9OJzM5NZX4pn_ex8',
    range: 'Attendance!E11:E25',
  });

  const students = studentsData.data.values;
  // remove any not filled in homework
  const assignments = assignmentsData.data.values[0].filter(item => !item.match(/[HW] [\d]/));
  const submissions = submissionsData.data.values;
  const attendances = attendancesData.data.values;

  // stringify homework
  const assignHomework = studentSubmissions => assignments.map((item, index) => `${item}: ${studentSubmissions[index]}`);

  // preparing the final output
  const assignedStudents = students.map((item, index) => ({
    name: `${item[0]} ${item[1]}`,
    email: item[2],
    submissions: assignHomework(submissions[index]),
    percentage: item[3],
    absences: attendances[index][0],
  }));

  console.log(assignedStudents);
  // sendMailTo(process.env.EMAILUSER, JSON.stringify(assignedStudents[0]));
  if (process.argv[2] === 'email') {
    assignedStudents.forEach(student => sendMailTo(student.email, student));
  }

  return assignedStudents;
};

fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), listHomework);
});

module.exports = {
  listHomework,
};
