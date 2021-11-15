const { google } = require("googleapis");
const fs = require("fs");
const chalk = require("chalk");
const { prompt } = require("inquirer");
const path = require("path");
const table = require("markdown-table");

/**
 * @func inquire Ask user what unit / repos they'd like to make the syllabus for.
 * @returns {Object} The unit to make the wiki for, and whether or not to show current repos.
 */
const inquire = async () => {
  return prompt([
    {
      message: "What unit do you want to make this wiki for?",
      type: "list",
      choices: ["Unit 1", "Unit 2", "Unit 3", "Unit 4"],
      name: "unit",
    },
    {
      message:
        "Would you like to show all repos to students, or limit today's?",
      type: "confirm",
      name: "show",
      default: true,
    },
  ]);
};

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
 * @func createTable
 * @desc Creates table from list of days, and links depending on if full show is allowed.
 * @param {*} realDays 
 * @param {*} show 
 * @returns 
 */
const createTable = (realDays, show) => {
  return table([
    ["Date", "Type", "Repo", "Solution", "Recording"],
    ...realDays.flat().reduce(
      (acc, line) => {
        if (!show) {
          if (acc.canReveal && line.date && line.date.includes("/")) {
            const lessonDate = new Date(line.date);
            if (lessonDate.getTime() > new Date().getTime()) {
              acc.canReveal = false;
            }
          }
        }
        acc.lines.push([
          line.date,
          line.type,
          line.link && acc.canReveal
            ? `[${line.name}](${line.link})`
            : line.name
            ? line.name
            : "",
          line.solutionLink && acc.canReveal
            ? `[${line.solution}](${line.solutionLink})`
            : line.solution && acc.canReveal
            ? `[${line.solution}](${line.link}/tree/solution)`
            : "",
          line.zoom,
        ]);
        return acc;
      },
      { lines: [], canReveal: true }
    ).lines,
  ]);
};

/**
 * @func createWiki
 * @desc Create a syllabus for a particular unit based on the curriculum roadmap structured by SEI NYC.
 * @author Soleil Solomon <soleil.solomon@generalassemb.ly>
 * @author Shay Kelley <shay.kelley@generalassemb.ly>
 * @author Zulay Scottborgh
 * @author Zoe Peterson <zoe.peterson@generalassemb.ly>
 * @param {Object} auth The authorization token from `src/services/auth.js`.
 */
const createWiki = async (auth) => {
  const sheets = google.sheets({ version: "v4", auth });
  const config = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../config/config.json"))
  );
  const { show, unit } = await inquire(config);
  const lessons = await buildLessons(auth, unit, config);
  const realDays = buildDays(lessons);
  const days = createTable(realDays, show);
  const wikiFilename = `./src/scripts/wiki/${
    config.config.cohort
  }-${unit.replace(/\ /g, "-").toLowerCase()}-wiki.md`;
  fs.writeFileSync(wikiFilename, days);
  console.log(
    `${chalk.bold.green(unit)} Wiki written for ${chalk.bold.green(
      config.config.cohort
    )} at ${chalk.bold.green(wikiFilename)}!`
  );
};

module.exports = createWiki;
