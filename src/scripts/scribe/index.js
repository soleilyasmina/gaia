const { google } = require("googleapis");
const fs = require("fs");
const chalk = require("chalk");
const { prompt } = require("inquirer");
const path = require("path");

/**
 * @func buildLessons
 * @desc Fetches lessons from the Curriculum Roadmap spreadsheet and reformats into object form.
 * @param {Object} auth The authorization token from `src/services/auth.js`.
 * @param {String} unit The unit to fetch from the Curriculum Roadmap.
 * @param {Object} config The fetched config object from `src/config/config.json`.
 * @returns {Array} A list of all planned in/post class exerclses exercises
 */
const buildLessons = async (auth, unit, config) => {
  try {
    const { cohort } = config.config;
    const sheets = google.sheets({ version: "v4", auth });
    const lessonsData = await sheets.spreadsheets.get({
      spreadsheetId: config.cohorts[cohort].curriculumRoadmap,
      ranges: [`${unit}!A1:K200`],
      includeGridData: true,
    });
    const lessons = lessonsData.data.sheets[0].data[0].rowData
      .map(({ values }) => values)
      .filter((val) => val[1] !== "")
      .map((line) => ({
        date: line[0].formattedValue,
        type: line[1].formattedValue,
        name: line[7].formattedValue,
        link: line[7].hyperlink,
        solution: line[8].formattedValue,
        solutionLink: line[8].hyperlink,
        zoom: line[9].hyperlink,
      }));
    return lessons;
  } catch (e) {
    console.log(e);
  }
};

/**
 * @func buildDays
 * @desc Create full days out of groups of lessons.
 * @param {Array} lessons List of all lessons / exercises taught / assigned.
 * @returns Array of days with all lessons / exercises per day.
 */
const buildDays = (lessons) => {
  const [actualDays] = lessons.reduce(
    (acc, curr) => {
      if (acc[1]) {
        acc[0].push(curr);
      } else {
        acc[1] = curr.date && curr.date.includes("UNIT");
      }
      return acc;
    },
    [[], false]
  );
  const separatedDays = actualDays.reduce(
    (acc, curr) => {
      if (curr.type === undefined) {
        acc.push([]);
      } else {
        acc[acc.length - 1].push(curr);
      }
      return acc;
    },
    [[]]
  );
  const realDays = separatedDays.filter((day) => day.length > 0);
  return realDays;
};

/**
 * @func isolateHomeworks
 * @desc Remove all non-evening exercises.
 * @param {Array} days 
 * @returns {Array} A filtered array of the individual exercises.
 */
const isolateHomeworks = (days) => {
  return days.filter((day) =>
    day.some(({ type }) => ["EE", "EA", "ECS"].includes(type))
  );
};

/**
 * @func createMessage
 * @desc Create a message for a particular day based on the curriculum roadmap structured by SEI NYC.
 * @author Soleil Solomon <soleil.solomon@generalassemb.ly>
 * @author Shay Kelley <shay.kelley@generalassemb.ly>
 * @author Zulay Scottborgh
 * @author Zoe Peterson <zoe.peterson@generalassemb.ly>
 * @param {Object} auth The authorization token from `src/services/auth.js`.
 */
const createMessage = async (auth) => {
  const sheets = google.sheets({ version: "v4", auth });
  const config = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../config/config.json"))
  );
  const { unit } = await prompt([
    {
      message: "What unit do you want to make this homework message for?",
      type: "list",
      choices: ["Unit 1", "Unit 2", "Unit 3", "Unit 4"],
      name: "unit",
    }
  ]);
  const lessons = await buildLessons(auth, unit, config);
  const realDays = buildDays(lessons);
  const homeworkDays = isolateHomeworks(realDays);
  const { day } = await prompt([
    {
      message: "Which day's homework would you like?",
      type: "list",
      name: "day",
      choices: () => {
        return homeworkDays.map((day) => ({
          name: day
            .map((day) => day.date)
            .filter((date) => !!date)
            .join(", "),
          value: day,
        }));
      },
    },
  ]);
  const homework = day.filter((line) =>
    ["EE", "EA", "ECS"].includes(line.type)
  );
  homework.forEach((hw) => {
    console.log(
      `${chalk.bold.green(hw.type)}: ${chalk.green(hw.name)} (${chalk.blue(hw.link)})!`
    );
  });
};

module.exports = createMessage;
