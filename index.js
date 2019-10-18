const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

require('dotenv').config();

// scope for readonly
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

// where the token is saved
const TOKEN_PATH = 'token.json';

// acquiring a new token
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
  // Node-side readline for info
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
  // it's time for us to grab some data
  const sheets = google.sheets({ version: 'v4', auth });
  // grab the individual students names
  const studentsData = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEETID,
    range: 'Homework Completion!B6:E20',
  });
  const enrollmentData = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEETID,
    range: 'Course Roster and Progress!F5:F19'
  })
  const assignmentsData = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEETID,
    range: 'Homework Completion!F5:BC5',
  });
  const submissionsData = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEETID,
    range: 'Homework Completion!F6:BC20',
  });
  const attendancesData = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEETID,
    range: 'Attendance!E11:E25',
  });

  const students = studentsData.data.values;
  // remove any not filled in homework
  const assignments = assignmentsData.data.values[0].filter((item) => !item.match(/[HW] [\d]/));
  const submissions = submissionsData.data.values;
  const attendances = attendancesData.data.values;
  const enrollments = enrollmentData.data.values;

  // stringify homework
  const assignHomework = studentSubmissions => assignments.map((item, index) => ({ [item]: studentSubmissions[index] }));

  // preparing the final output
  const assignedStudents = students.map((item, index) => ({
    name: `${item[0]} ${item[1]}`,
    email: item[2],
    percentage: item[3],
    absences: attendances[index][0],
    enrollment: enrollments[index][0],
    submissions: assignHomework(submissions[index]),
  }));
  
  console.table(assignedStudents);
  return assignedStudents;
};

fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), listHomework);
});

module.exports = {
  listHomework,
};
