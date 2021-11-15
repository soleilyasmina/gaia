const fs = require('fs');
const { google } = require('googleapis');
const path = require("path");

// more on this query: src/services/README.md
const provideStudents = async (auth) => {
  try {
    // it's time for us to grab some data
    const sheets = google.sheets({ version: 'v4', auth });
    // grab the individual students names

    const configPath = path.resolve(__dirname, "../config/config.json");
    const config = JSON.parse(fs.readFileSync(configPath));

    const spreadsheetId = config.cohorts[config.config.cohort].courseTracker;

    // this fetches 50 possible students starting at B5, by checking student ids and...
    const studentIdData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Course Roster and Progress!B5:B55',
    });
    
    // ... filtering out any items without student ids. this gives us our students for the cohort
    const totalStudents = studentIdData.data.values.filter((val) => val[0] !== '')
      .length;

    // first we fetch their names, email addresses, and homework completions
    const studentsData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `HW Completion!B6:E${6 + totalStudents - 1}`,
    });
    // then we establish if they're enrolled or not
    const enrollmentData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Course Roster and Progress!F5:F${5 + totalStudents - 1}`,
    });
    // we check github usernames for all students
    const githubData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Course Roster and Progress!H5:H${5 + totalStudents - 1}`,
    });
    // then check the assignments listed in row 5 starting at column F
    const assignmentsData = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: ['HW Completion!F5:ZZ5'],
      includeGridData: true,
    });

    // then we check on every students' completion of said assignments
    const submissionsData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `HW Completion!F6:ZZ${6 + totalStudents - 1}`,
    });
    // finally, we fetch the students' attendance percentage
    const attendancesData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Attendance!E12:E${12 + totalStudents - 1}`,
    });

    // this entire section is just taking the actual data from the sheets.spreadsheets call from earlier
    const students = studentsData.data.values;
    // remove any not filled in homework
    const assignments = assignmentsData.data.sheets[0].data[0].rowData[0].values.filter(
      (item) => !!item.hyperlink
    );
    const submissions = submissionsData.data.values;
    const attendances = attendancesData.data.values;
    const enrollments = enrollmentData.data.values;
    const githubs = githubData.data.values;

    // convert homework from formula to items
    const assignHomework = (studentSubmissions) => assignments.map((item, index) => {
      try {
        if (!studentSubmissions) {
          throw new Error;
        }
        return {
          completion: studentSubmissions[index],
          link: item.hyperlink,
          name: item.formattedValue,
        };
      } catch (e) {
        return {};
      }
    });

    // preparing the final output
    const assignedStudents = students.map((item, index) => {
      try {
        const currentSubmission = submissions ? submissions[index] : [];
        return {
          name: `${item[0]} ${item[1]}`,
          firstName: item[0],
          lastName: item[1],
          username: githubs && githubs[index] ? githubs[index][0] : null,
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
    return assignedStudents;
  } catch (e) {
    console.log(e);
  }
};

module.exports = provideStudents;
