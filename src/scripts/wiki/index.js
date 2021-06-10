const { google } = require("googleapis");
const fs = require("fs");
const chalk = require("chalk");
const { prompt } = require("inquirer");
const path = require("path");
const table = require("markdown-table");

const inquire = async (config) => {
  return prompt([
    {
      message: "What unit do you want to make this wiki for?",
      type: "list",
      choices: ["Unit 1", "Unit 2", "Unit 3", "Unit 4"],
      name: "unit",
    }
  ]);
};

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

const createTable = (realDays) => {
  return table([
    ["Date", "Type", "Repo", "Solution", "Recording"],
    ...realDays
      .flat()
      .map((line) => [
        line.date,
        line.type,
        line.link ? `[${line.name}](${line.link})` : line.name ? line.name : "",
        line.solutionLink
          ? `[${line.solution}](${line.solutionLink})`
          : line.solution
          ? `[${line.solution}](${line.link}/tree/solution)`
          : "",
        line.zoom,
      ]),
  ]);
};

const createWiki = async (auth) => {
  const sheets = google.sheets({ version: "v4", auth });
  const config = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../config/config.json"))
  );
  const { unit } = await inquire(config);
  const lessons = await buildLessons(auth, unit, config);
  const realDays = buildDays(lessons);
  const days = createTable(realDays);
  const wikiFilename = `./src/scripts/wiki/${config.config.cohort}-${unit
    .replace(/\ /g, "-")
    .toLowerCase()}-wiki.md`;
  fs.writeFileSync(wikiFilename, days);
  console.log(
    `${chalk.bold.green(unit)} Wiki written for ${chalk.bold.green(
      config.config.cohort
    )} at ${chalk.bold.green(wikiFilename)}!`
  );
};

module.exports = createWiki;
