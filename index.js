/* eslint-disable no-console */
const ghost = require('./ghost');
const mailer = require('./mailer');
const provideStudents = require('./students');
const update = require('./update');

const main = async () => {
  const args = process.argv;
  let test = false;
  if (args.include('-t') || args.includes('--test')) {
    test = true;
  }
  if (args.includes('-u') || args.includes('--update')) {
    update();
  }
  if (args.includes('-s') || args.includes('--setup')) {
    await provideStudents();
  }
  if (args.includes('-g') || args.includes('--ghost')) {
    const [auth, students] = await provideStudents();
    await ghost(auth, students, test);
  }
  if (args.includes('-m') || args.includes('--mailedit')) {
    const [auth, students] = await provideStudents();
    await mailer(students, test);
  }
  console.log('Thank you for using GAIA.');
};

main();
