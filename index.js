const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const mailer = require('./mailer');

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
      return callback(oAuth2Client);
    });
  });
};

// to authorize and grab secret
const authorize = async (credentials, callback) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // check if a token exists
  try {
    const token = fs.readFileSync(TOKEN_PATH)
    oAuth2Client.setCredentials(JSON.parse(token));
    return await callback(oAuth2Client);
  } catch (e) {
    return getNewToken(oAuth2Client, callback);    
  }
};

const provideStudentsCallback = async (auth) => {
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
    valueRenderOption: 'FORMULA'
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

  // convert homework from formula to items
  const assignHomework = studentSubmissions => assignments.map((item, index) => {
    let [ link, name ] = item.replace('=HYPERLINK(','').replace(/[")]/g, '').split(',');
    if (!name) {
      name = link;
      link = undefined;
    }
    return { 
      completion: studentSubmissions[index],
      link,
      name
    }
  });

  // preparing the final output
  const assignedStudents = students.map((item, index) => ({
    name: `${item[0]} ${item[1]}`,
    email: item[2],
    percentage: item[3],
    absences: attendances[index][0],
    enrollment: enrollments[index][0],
    submissions: assignHomework(submissions[index]),
    index,
  }));
  return assignedStudents;
};

const provideStudents = async () => {
  try {
    const content = fs.readFileSync('credentials.json');
    return await authorize(JSON.parse(content), provideStudentsCallback);
  } catch (e) {
    return console.log('Error loading client secret file:', e);
  }
}

(async () => {
  await mailer(await provideStudents());
})();

module.exports = provideStudents;
