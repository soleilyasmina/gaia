const { google } = require("googleapis");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

/**
 * @func buildStudents
 * @desc obtain student information and filter out unimportant information.
 * @param {Object} auth The authorization token from `src/services/auth.js`.
 * @param {Object} config The fetched config object from `src/config/config.json`.
 * @returns {Array} an array of the current cohort's student information
 */
const buildStudents = async (auth, config) => {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = config.cohorts[config.config.cohort].progressReport;
    const studentsData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Copy of MC PR - Instructor Answers!A2:N50",
    });
    const actualStudents = studentsData.data.values
      .filter((val) => val[0] !== "")
      .map((stu) => ({
        instructorEmail: stu[0],
        studentName: stu[1],
        studentEmail: stu[2],
        course: stu[3],
        startDate: stu[4],
        completionDate: stu[5],
        material: stu[6],
        notCovered: stu[7],
        absences: stu[8],
        progress: stu[9],
        comments: stu[10],
        signature: stu[11],
        date: stu[12],
        instance: stu[13],
      }));
    return actualStudents;
  } catch (e) {
    console.log(e);
  }
};

/**
 * @func createURL
 * @desc Create the url string for the feedback form.
 * @param {Object} student 
 * @returns {String} An incredibly long string with all form inputs prefilled via query parameters. 
 */
const createURL = (student) => {
  return `https://docs.google.com/forms/d/1qCESl4k5-0uQgguegevhWVKGnfsOMM_DBt5FbigWTgA/viewform?entry.1484115108=${student.instance}&entry.1656736058=${encodeURIComponent(student.instructorEmail)}&entry.890964849=${encodeURIComponent(student.studentName)}&entry.1199003076=${encodeURIComponent(student.studentEmail)}&entry.1480674979=${encodeURIComponent(student.course)}&entry.134546973_year=${student.startDate.split('/')[2]}&entry.134546973_month=${student.startDate.split('/')[0]}&entry.134546973_day=${student.startDate.split('/')[1]}&entry.1047108904_year=${student.completionDate.split('/')[2]}&entry.1047108904_month=${student.completionDate.split('/')[0]}&entry.1047108904_day=${student.completionDate.split('/')[1]}&entry.250291501=${encodeURIComponent(student.material)}&entry.1759656636=${encodeURIComponent(student.notCovered)}&entry.342172517=${encodeURIComponent(student.absences)}&entry.1822047334=${encodeURIComponent(student.progress)}&entry.1162874525=${encodeURIComponent(student.comments)}&entry.898490519=${encodeURIComponent(student.signature)}&entry.1445306327_year=${student.date.split('/')[2]}&entry.1445306327_month=${student.date.split('/')[0]}&entry.1445306327_day=${student.date.split('/')[1]}`;
}

const puppetmaster = async (auth) => {
  const configPath = path.resolve(__dirname, "../../config/config.json");
  const config = JSON.parse(fs.readFileSync(configPath));
  const students = await buildStudents(auth, config);
  //await Promise.all(students.map(async (student) => await fillForm(student, browser)));
  const urls = students.map(createURL).join('\n');
  const newFilename = path.resolve(__dirname, `${config.config.cohort}-progress.md`);
  fs.writeFileSync(newFilename, urls);
  console.log(
    `Progress report written for ${chalk.bold.green(
      config.config.cohort
    )} at ${chalk.bold.green(newFilename)}!`
  );
};

module.exports = puppetmaster;
