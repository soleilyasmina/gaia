// Code originally from Andre Pato, @anpato
const nodemailer = require('nodemailer');

const { filterEnrolled } = require('../helpers');
const template = require('./template');

require('dotenv').config();

const mailer = async (students, test) => {
  try {
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
      const enrolledStudents = filterEnrolled(students); 
      if (test) {
        await transporter.sendMail({
          from: process.env.EMAILUSER,
          to: process.env.EMAILUSER,
          subject: 'Test Progress Report',
          html: template(enrolledStudents[0]),
        });
        console.log(`Sending test email for ${enrolledStudents[0].name} to ${process.env.EMAILUSER}.`)
        transporter.close();
      } else {
        await enrolledStudents.forEach(async (student) => {
          await transporter.sendMail({
            from: process.env.EMAILUSER,
            to: student.email,
            subject: 'Progress Report',
            html: template(student),
          });
          console.log(`Sending email to ${student.name} at ${student.email}.`);
          sent += 1;
          if (sent === enrolledStudents.length) {
            transporter.close();
            console.log('All Messages Sent');
          }
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
  console.log('Mailer is complete!');
};

module.exports = mailer;
