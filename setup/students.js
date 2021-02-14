const fs = require('fs');
const { google } = require('googleapis');

const { authorize } = require('./auth');

const provideStudentsCallback = async (auth) => {
  try {
  // it's time for us to grab some data
    const sheets = google.sheets({ version: 'v4', auth });
    // grab the individual students names

    const studentIdData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEETID,
      range: 'Course Roster and Progress!B5:B50',
    });

    const totalStudents = studentIdData.data.values.filter((val) => val[0] !== '')
      .length;

    const studentsData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEETID,
      range: `HW Completion!B6:E${6 + totalStudents - 1}`,
    });
    const enrollmentData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEETID,
      range: `Course Roster and Progress!F5:F${5 + totalStudents - 1}`,
    });
    const githubData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEETID,
      range: `Course Roster and Progress!H5:H${5 + totalStudents - 1}`,
    });
    const assignmentsData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEETID,
      range: 'HW Completion!F5:BD5',
      valueRenderOption: 'FORMULA',
    });
    const submissionsData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEETID,
      range: `HW Completion!F6:BD${6 + totalStudents - 1}`,
    });
    const attendancesData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEETID,
      range: `Attendance!E11:E${11 + totalStudents - 1}`,
    });

    const students = studentsData.data.values;
    // remove any not filled in homework
    const assignments = assignmentsData.data.values[0].filter(
      (item) => !item.match(/[HW] [\d]/),
    );
    const submissions = submissionsData.data.values;
    const attendances = attendancesData.data.values;
    const enrollments = enrollmentData.data.values;
    const githubs = githubData.data.values;

    // convert homework from formula to items
    const assignHomework = (studentSubmissions) => assignments.map((item, index) => {
      let [link, name] = item
        .replace('=HYPERLINK(', '')
        .replace(/[")]/g, '')
        .split(',');
      if (!name) {
        name = link;
        link = undefined;
      }
      return {
        completion: studentSubmissions[index],
        link,
        name,
      };
    });

    // preparing the final output
    const assignedStudents = students.map((item, index) => {
      try {
        const currentSubmission = submissions ? submissions[index] : [];
        return {
          name: `${item[0]} ${item[1]}`,
          firstName: item[0],
          lastName: item[1],
          username: githubs[index][0],
          email: item[2],
          percentage: item[3],
          absences: attendances[index][0],
          enrollment: enrollments[index][0],
          submissions: assignHomework(currentSubmission),
          index,
        };
      } catch (error) {
        console.log(error);
      }
    });
    return {
      auth,
      students: assignedStudents,
    };
  } catch (e) {
    console.log(e);
  }
};

const provideStudents = async () => {
  try {
    return await authorize(provideStudentsCallback);
  } catch (e) {
    return console.log('Error loading client secret file:', e);
  }
};

module.exports = provideStudents;
