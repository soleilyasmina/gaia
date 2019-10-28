/* eslint-disable no-console */
const provideStudents = require('./students');
const ghost = require('./ghost');
const mailer = require('./mailer');

const main = async () => {
  const args = process.argv;
  if (args.includes('-g') || args.includes('--ghost')) {
    const [auth, students] = await provideStudents();
    await ghost(auth, students);
  }
  if (args.includes('-m') || args.includes('--mailedit')) {
    const [auth, students] = await provideStudents();
    await mailer(students);
  }
  console.log('Thank you for using GAIA.');
};

main();
