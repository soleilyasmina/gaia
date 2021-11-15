const { google } = require("googleapis");
const fs = require("fs");
const axios = require("axios");
const chalk = require("chalk");
const { prompt } = require("inquirer");
const path = require("path");

/**
 * @func inquire Ask user what unit / repos they'd like to update in the syllabus.
 * @returns {Object} The unit to make the wiki for.
 */
const inquire = async () => {
  return prompt([
    {
      message: "What unit do you want to make this wiki for?",
      type: "checkbox",
      choices: ["Unit 1", "Unit 2", "Unit 3", "Unit 4"],
      name: "units",
    },
  ]);
};

/**
 * @func buildLessons
 * @desc Fetches lessons from the Curriculum Roadmap spreadsheet and reformats into object form.
 * @param {Object} auth The authorization token from `src/services/auth.js`.
 * @param {String} units The units to fetch from the Curriculum Roadmap.
 * @param {Object} config The fetched config object from `src/config/config.json`.
 * @returns {Array} A list of all planned in/post class exerclses exercises
 */
const buildLessons = async (auth, units, config) => {
  try {
    const { cohort } = config.config;
    const sheets = google.sheets({ version: "v4", auth });
    const lessonsData = await sheets.spreadsheets.get({
      spreadsheetId: config.cohorts[cohort].curriculumRoadmap,
      ranges: units.map((unit) => `${unit}!A1:K200`),
      includeGridData: true,
    });
    const lessons = lessonsData.data.sheets
      .map((sheet) =>
        sheet.data[0].rowData
          .map(({ values }) => values)
          .filter(
            (val) =>
              val[1] !== "" &&
              val[6].hyperlink &&
              val[7].hyperlink &&
              val[7].hyperlink.includes("https://git.generalassemb.ly") &&
              !val[7].hyperlink.includes(cohort)
          )
          .map((line) => ({
            date: line[0].formattedValue,
            type: line[1].formattedValue,
            mainName: line[6].formattedValue,
            mainLink: line[6].hyperlink,
            cohortName: line[7].formattedValue,
            cohortLink: line[7].hyperlink,
          }))
      )
      .flat();
    return lessons;
  } catch (e) {
    console.log(e);
  }
};

/**
 * @func createUrl
 * @desc Reformat url for commit messages.
 * @param {String} url 
 * @returns Newly formatted URL.
 */
const createUrl = (url) =>
  url
    .replace(
      "https://git.generalassemb.ly/",
      "https://git.generalassemb.ly/api/v3/repos/"
    )
    .concat("/commits");

/**
 * 
 * @param {Object} lesson Object with info on a given lesson
 * @param {Object} config The fetched config object from `src/config/config.json`.
 */
const createComparisons = async (lesson, config) => {
  const mainResp = await axios.get(createUrl(lesson.mainLink), {
    headers: {
      Authorization: `token ${config.config.token}`,
    },
  });
  const cohortResp = await axios.get(createUrl(lesson.cohortLink), {
    headers: {
      Authorization: `token ${config.config.token}`,
    },
  });
  if (mainResp.data[0].sha !== cohortResp.data[0].sha) {
    console.log(
      `${chalk.bold.red(lesson.cohortName)} needs updates: ${chalk.blue(
        lesson.cohortLink
      )}`
    );
  } else {
    console.log(
      `${chalk.bold.green(lesson.cohortName)} is ready: ${chalk.blue(
        lesson.mainLink
      )}`
    );
  }
};

/**
 * @func exchange
 * @author Soleil Solomon <soleil.solomon@generalassemb.ly>
 * @desc A curriculum updater tool that compares existing repos in a roadmap with their master link.
 * @param {Object} auth The authorization token from `src/services/auth.js`.
 */
const exchange = async (auth) => {
  const config = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../config/config.json"))
  );
  const { units } = await inquire(config);
  const lessons = await buildLessons(auth, units, config);
  await Promise.all(lessons.map((lesson) => createComparisons(lesson, config)));
};

module.exports = exchange;
