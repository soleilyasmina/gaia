// Code originally from Andre Pato, @anpato
const nodemailer = require('nodemailer')

const template = require('./template');

const mailer = async (students) => {
  try {
    let sent = 0;
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      pool: true,
      secure: true,
      auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASS
      }
    });
    if (students) {
      await students.forEach(async (student) => {
        await transporter.sendMail({
          from: process.env.EMAILUSER,
          to: student.email,
          subject: 'Progress Report',
          html: template(student)
        });
        console.log(`Sending email to ${student.name} at ${student.email}.`);
        sent++;
        if (sent === students.length) {
          transporter.close();
          console.log('All Messages Sent');
        }
      });
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = mailer;
