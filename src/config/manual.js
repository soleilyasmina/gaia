const chalk = require('chalk');

const manual = () => {
  console.log(`${chalk.bold('Welcome to the GAIA manual!')} Here is a list of each command and what they do, sorted by type.`);
  console.log(`${chalk.bold.red('\nSETUP && HELP\n')}`);
  console.log(`${chalk.bold.green('Help')}: This opens this manual. Hello!`);
  console.log(`${chalk.bold.green('Config')}: This should be the first command that you run when cloning this repo for the first time. After running this command, the CLI will prompt you for information regarding your GitHub account, GMail, course tracker, and curriculum roadmap to add to your config.json.`);
  console.log(`${chalk.bold.green('Update')}: This will open the CLI to update your cohort and course tracker spreadsheet id.`);
  console.log(`${chalk.bold.green('Status')}: This attempts to source data from the students sheet to confirm you are logged in with proper credentials.`);
  console.log(`${chalk.bold.red('\nPROJECTS && FEEDBACK\n')}`);
  console.log(`${chalk.bold.green('Projects')}: This tool sources data from the course tracker to create a project tracker.`);
  console.log(`${chalk.bold.green('Feedback')}: This tool sources the project tracker to send feedback to students.`);
  console.log(`${chalk.bold.green('Progress')}: This tool sources data from the course tracker to create a progress report for a given cohort.`);
  console.log(`${chalk.bold.green('Puppetmaster')}: This tool sources the progress tracker to create URLs that autofill the Google form for the progress report.`);
  console.log(`${chalk.bold.red('\nHOMEWORK && PROGRESS\n')}`);
  console.log(`${chalk.bold.green('GHOST')}: This tool sources data from GitHub to provide real-time information regarding homework completion, and updates the course tracker accordingly.`);
  console.log(`${chalk.bold.green('Mailed It!')}: This tool sources data from the course tracker to send a progress report.`);
  console.log(`${chalk.bold.green('Wiki')}: This tool sources data from the curriculum roadmap to create a syllabus.`);
  console.log(`${chalk.bold.green('Scribe')}: This tool sources data from the curriculum roadmap to create a homework message sendable via Slack.`);
  console.log(`${chalk.bold.red('\nCURRICULUM MANAGEMENT\n')}`);
  console.log(`${chalk.bold.green('Exchange')}: This tool sources data from the curriculum roadmap to analyze what repos need to be updated / forked / are ready to teach.`);
};

module.exports = manual;
