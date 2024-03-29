/* eslint-disable no-console */
const fs = require("fs");
const { prompt, Separator } = require("inquirer");
const config = require("./config");
const manual = require("./config/manual");
const exchange = require("./scripts/exchange");
const feedback = require("./scripts/feedback");
const ghost = require("./scripts/ghost");
const mailer = require("./scripts/mailer");
const progress = require("./scripts/progress");
const projects = require("./scripts/projects");
const puppetmaster = require("./scripts/puppetmaster");
const scribe = require("./scripts/scribe");
const status = require("./scripts/status");
const update = require("./scripts/update");
const wiki = require("./scripts/wiki");
const { filterEnrolled } = require("./services/helpers");
const { authorize } = require('./services/auth');

const main = async () => {
  try {
    if (
      !fs.existsSync(__dirname + "/config/credentials.json") ||
      !fs.existsSync(__dirname + "/config/config.json") ||
      !fs.existsSync(__dirname + "/config/token.json")
    ) {
      config();
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
            "exchange",
            new Separator(),
            "config",
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
        case "config":
          config();
          break;
        case "status":
          await authorize(status);
          break;
        case "update":
          update();
          break;
        case "help":
          manual();
          break;
        case "exchange":
          await authorize(exchange);
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
