const fs = require('fs');
const rl = require('readline-sync');

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
  fs.readFile('./random/weight.json', 'utf8', (err, data) => {
    if (err) {
      createJSON(students);
      console.log('Students created! Run this again to choose a random student.');
      return;
    }
    const source = filterEnrolled(JSON.parse(data));
    const toUpdate = [...source];
    let chosen = null;
    while (!chosen) {
      const random = Math.floor(Math.random() * source.length);
      if (source[random].picks === 0) {
        const isHere = rl.question(`Is ${toUpdate[random].name} here today? [y/n] \n`);
        if (['y', 'Y', 'yes'].includes(isHere)) {
          console.log(`${toUpdate[random].name} has been picked.`);
          toUpdate[random].picks += 1;
          chosen = toUpdate[random];
        } else {
          console.log('Picking another student.');
        }
      } else {
        source[random].picks -= 1;
      }
    }
    fs.writeFileSync('./random/weight.json', JSON.stringify(toUpdate));
  });
};

module.exports = getRandomStudent;
