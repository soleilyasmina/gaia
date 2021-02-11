const { google } = require("googleapis");
const fs = require("fs");
const { prompt } = require("inquirer");
const table = require("markdown-table");

const inquire = async () => {
  return prompt([
    {
      message: "What unit do you want to make this wiki for?",
      type: "list",
      choices: ["Unit 1", "Unit 2", "Unit 3", "Unit 4"],
      name: "unit",
    },
    {
      message: "Please enter the spreadsheet id.",
      type: "input",
      name: "spreadsheetId",
    },
  ]);
};

const buildLessons = async (auth, { unit, spreadsheetId }) => {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const lessonsData = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: [`${unit}!A1:K140`],
      includeGridData: true,
    });
    console.log(lessonsData.data.sheets[0].data[0].rowData);
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
  console.log(realDays);
  const tableTime = table([
    ["Date", "Type", "Repo", "Solution", "Recording"],
    ...realDays.flat().map((line) => [
        line.date,
        line.type,
        line.link ? `[${line.name}](${line.link})` : line.name ? line.name : "",
      line.solutionLink ? `[${line.solution}](${line.solutionLink})` : line.solution ? `[${line.solution}](${line.link}/tree/solution)` : "",
        line.zoom,
      ]),
  ]);
  return tableTime;
};

const createWiki = async (auth) => {
  const sheets = google.sheets({ version: "v4", auth });
  const results = await inquire();
  const lessons = await buildLessons(auth, results);
  const days = buildDays(lessons);
  fs.writeFileSync(
    `./wiki/${process.env.COHORT}-${results.unit
      .replace(/\ /g, "-")
      .toLowerCase()}-wiki.md`,
    days
  );
};

module.exports = createWiki;
