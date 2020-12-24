const fs = require('fs');
const inquirer = require('inquirer');

const { filterEnrolled } = require('../helpers');

const createJSON = (students) => {
  const layout = filterEnrolled(students).map((stu) => ({
    name: stu.name,
    enrollment: stu.enrollment,
    picks: 0,
  }));
  fs.writeFileSync('./random/weight.json', JSON.stringify(layout));
  return layout;
};

const getRandomStudent = (students) => {
  fs.readFile('./random/weight.json', 'utf8', async (err, data) => {
    if (err) {
      createJSON(students);
    }
    const source = filterEnrolled(JSON.parse(data));
    const toUpdate = [...source];
    let chosen = null;
    while (source.length > 0 && !chosen) {
      const random = Math.floor(Math.random() * source.length);
      if (source[random].picks === 0) {
        const { isHere } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'isHere',
            message: `Is ${toUpdate[random].name} here today?`,
          },
        ]);
        if (isHere) {
          console.log(`${toUpdate[random].name} has been picked.`);
          toUpdate[random].picks += 1;
          chosen = toUpdate[random];
        } else {
          console.log('Gotcha, picking another student.');
          source.splice(random, 1);
        }
      } else {
        source[random].picks -= 1;
      }
    }
    fs.writeFileSync('./random/weight.json', JSON.stringify(toUpdate));
  });
};

module.exports = getRandomStudent;
