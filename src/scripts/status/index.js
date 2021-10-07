const fs = require("fs");
const { filterEnrolled } = require("../../services/helpers");
const provideStudents = require("../../services/students");

const createHomeworkCompletions = (submissions) => {
  const { Complete, Incomplete, Missing }= submissions
    .reduce(
      (acc, submission) => {
        return {
          ...acc,
          [submission.completion]: acc[submission.completion] + 1
        };
      },
      {
        Complete: 0,
        Incomplete: 0,
        Missing: 0,
      }
    );
  const formattedString = `${Complete} Complete, ${Incomplete} Incomplete, ${Missing} Missing`;
  return formattedString;
};

const createStatus = async (auth) => {
  const students = await provideStudents(auth);
  const filteredInfo = filterEnrolled(students).map((student) => ({
    name: student.name,
    percentage: student.percentage,
    absences: student.absences,
    submissions: createHomeworkCompletions(student.submissions),
  }));
  console.table(filteredInfo);
};

module.exports = createStatus;
