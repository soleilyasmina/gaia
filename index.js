/* eslint-disable no-console */
const ghost = require('./ghost');
const mailer = require('./mailer');
const random = require('./random');
const provideStudents = require('./setup/students');
const update = require('./setup/update');

const main = async () => {
  try {
    const args = process.argv;
    let test = false;
    if (args.includes('-t') || args.includes('--test')) {
      test = true;
    }
    if (args.includes('-u') || args.includes('--update')) {
      update();
    }
    if (args.includes('-r') || args.includes('--random')) {
      const { students } = await provideStudents();
      await random(students);
    }
    if (args.includes('-a') || args.includes('--auth')) {
      const { students } = await provideStudents();
      console.table(students);
    }
    if (args.includes('-g') || args.includes('--ghost')) {
      const { auth, students } = await provideStudents();
      await ghost(auth, students, test);
    }
    if (args.includes('-m') || args.includes('--mailedit')) {
      const { students } = await provideStudents();
      await mailer(students, test);
    }
    console.log('Thank you for using GAIA.');
  } catch (e) {
    if (e.message === '(intermediate value) is not iterable') {
      console.log('Readline is waiting (don\'t worry).');
    } else {
      console.log(e.message);
    }
  }
};

main();
