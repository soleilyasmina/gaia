/* eslint-disable no-console */
const fs = require("fs");
const { prompt, Separator } = require("inquirer");
const setup = require("./config");
const manual = require("./config/manual");
const feedback = require("./scripts/feedback");
const ghost = require("./scripts/ghost");
const mailer = require("./scripts/mailer");
const progress = require("./scripts/progress");
const projects = require("./scripts/projects");
const puppetmaster = require("./scripts/puppetmaster");
const scribe = require("./scripts/scribe");
const update = require("./scripts/update");
const wiki = require("./scripts/wiki");
const { filterEnrolled } = require("./services/helpers");
const { authorize, getNewToken } = require('./services/auth');
const provideStudents = require("./services/students");

const main = async () => {
  try {
    if (
      !fs.existsSync(__dirname + "/config/config.json") ||
      !fs.existsSync(__dirname + "/config/token.json")
    ) {
      setup();
    } else {
      const { choice } = await prompt([
        {
          message: "Welcome to GAIA! What would you like to run today?",
          type: "list",
          name: "choice",
          choices: [
            "ghost",
            "mailedit",
            "wiki",
            "scribe",
            new Separator(),
            "projects",
            "feedback",
            "progress",
            "puppetmaster",
            new Separator(),
            "setup",
            "update",
            "help",
            "status",
            new Separator(),
          ],
        },
      ]);
      let test;
      if (["ghost", "mailedit", "feedback"].includes(choice)) {
        test = (
          await prompt([
            {
              type: "confirm",
              name: "test",
              message: "Is this a test run?",
              default: true,
            },
          ])
        ).test;
      }
      switch (choice) {
        case "setup":
          setup();
          break;
        case "status":
          const students = await authorize(provideStudents);
          console.table(filterEnrolled(students));
          break;
        case "update":
          update();
          break;
        case "help":
          manual();
          break;
        case "ghost":
          await authorize(ghost, test);
          break;
        case "mailedit":
          await authorize(mailer, test);
          break;
        case "projects":
          await authorize(projects);
          break;
        case "feedback":
          await authorize(feedback, test);
          break;
        case "puppetmaster":
          await authorize(puppetmaster);
          break;
        case "progress":
          await authorize(progress);
          break;
        case "scribe":
          await authorize(scribe);
          break;
        case "wiki":
          await authorize(wiki);
          break;
        default:
          console.table(filterEnrolled(students));
      }
    }
  } catch (e) {
    if (e.message === "(intermediate value) is not iterable") {
      console.log("Readline is waiting (don't worry).");
    } else {
      console.log(e.message);
    }
  }
};

main();
