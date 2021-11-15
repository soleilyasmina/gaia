const { filterEnrolled } = require("../../services/helpers");
const provideStudents = require("../../services/students");

/**
 * @func createHomeworkCompletions
 * @desc Create formatted string of homework submissions.
 * @param {Array} submissions Array of all homework submissions per student.
 * @returns {String} Formatted string of homework submissions.
 */
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

/**
 * @func createStatus
 * @desc Print a quick status update on all students.
 * @param {Object} auth The authorization token from `src/services/auth.js`.
 */
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
