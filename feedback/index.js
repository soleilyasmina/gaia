// Code originally from Andre Pato, @anpato
const fs = require('fs');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const inquirer = require('inquirer');

require('dotenv').config();

const fillTemplate = (student, unit, name, template) => template
  .replace('[FIRSTNAME]', student.firstName)
  .replace('[UNIT]', unit)
  .replace('[GIST]', student.gist)
  .replace('[INSTRUCTORNAME]', name);

const mailer = async (students, unit, name, test) => {
  try {
    const template = fs.readFileSync('./feedback/template.txt', 'utf8');
    let sent = 0;
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      pool: true,
      secure: true,
      auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASS,
      },
    });
    if (students) {
      if (test) {
        await transporter.sendMail({
          from: process.env.EMAILUSER,
          to: process.env.EMAILUSER,
          subject: 'Test Project Feedback',
          text: fillTemplate(students[0], unit.split(' ')[1], name, template),
        });
        console.log(`Sending test email for ${students[0].name} to ${process.env.EMAILUSER}.`);
        transporter.close();
      } else {
        await students.forEach(async (student) => {
          await transporter.sendMail({
            from: process.env.EMAILUSER,
            to: student.email,
            subject: 'Project Feedback',
            text: fillTemplate(student, unit.split(' ')[1], name, template),
          });
          console.log(`Sending email to ${student.name} at ${student.email}.`);
          sent += 1;
          if (sent === students.length) {
            transporter.close();
            console.log('All Messages Sent');
          }
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
  console.log('Feedback is complete!');
};

const buildStudents = async (auth, unit) => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env[`PROJECT_${unit.split(' ')[1]}_SHEETID`];
    const studentsData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Copy of Project Completions!A2:F50',
    });
    const actualStudents = studentsData.data.values
      .filter((val) => val[0] !== '')
      .map((stu) => ({
        name: `${stu[0]} ${stu[1]}`,
        firstName: stu[0],
        email: stu[4],
        gist: stu[5],
      }));
    return actualStudents;
  } catch (e) {
    console.log(e);
  }
};

const deliverFeedback = async (auth, test) => {
  const { unit } = await inquirer
    .prompt([{
      type: 'rawlist',
      choices: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Exit'],
      default: 4,
      name: 'unit',
      message: 'What unit is this project for?',
    }]);
  if (unit + 1 === 5) return;
  if (!process.env[`PROJECT_${unit.split(' ')[1]}_SHEETID`]) {
    console.log('No matching sheet for this unit found! Check your .env file.');
    return;
  }
  const { name } = await inquirer.prompt([{
    type: 'input',
    name: 'name',
    message: 'What is your name? (Capitalize the first letter.)',
  }]);
  const students = await buildStudents(auth, unit);
  await mailer(students, unit, name, test);
};

module.exports = deliverFeedback;
