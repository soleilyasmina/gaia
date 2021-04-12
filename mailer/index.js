// Code originally from Andre Pato, @anpato
const nodemailer = require("nodemailer");

const fs = require("fs");
const path = require("path");
const { prompt } = require("inquirer");

const { filterEnrolled } = require("../helpers");
const template = require("./template");

require("dotenv").config();

const mailer = async (students, test) => {
  try {
    const configPath = path.resolve(__dirname, "../config.json");
    const config = JSON.parse(fs.readFileSync(configPath));
    let sent = 0;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      pool: true,
      secure: true,
      auth: {
        user: config.config.emailUser,
        pass: config.config.emailPass,
      },
    });
    if (students) {
      const enrolledStudents = filterEnrolled(students);
      if (test) {
        await transporter.sendMail({
          from: config.config.emailUser,
          to: config.config.emailUser,
          subject: "Test Progress Report",
          html: template(enrolledStudents[0]),
        });
        console.log(
          `Sending test email for ${enrolledStudents[0].name} to ${config.config.emailUser}.`
        );
        transporter.close();
      } else {

        const selected = await prompt({
          message: "Choose students to mail:\n(All students are selected by default.)\n",
          name: "indexesToMail",
          type: "checkbox",
          loop: false,
          choices: enrolledStudents.map((student, i) => ({name: student.name, value: i, checked: true}) )
        })

        const studentsToMail = enrolledStudents.filter((student, i) => selected.indexesToMail.includes(i))

        await studentsToMail.forEach(async (student) => {
          await transporter.sendMail({
            from: config.config.emailUser,
            to: student.email,
            subject: "Progress Report",
            html: template(student),
          });
          console.log(`Sending email to ${student.name} at ${student.email}.`);
          sent += 1;
          if (sent === enrolledStudents.length) {
            transporter.close();
            console.log("All Messages Sent");
          }
        });
      }
    }
    console.log("Mailer is complete!");
  } catch (error) {
    console.log(error);
  }
};

module.exports = mailer;
