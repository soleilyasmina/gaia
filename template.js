const formattedSubmissions = (submissions) => (
  submissions.map((sub) => {
    let completionStyle;
    switch (sub.completion) {
      case 'Complete':
        completionStyle = '#b7e1cd';
        break;
      case 'Incomplete':
        completionStyle = '#fce8b2';
        break;
      default:
        completionStyle = '#f4c7c3';
        break;
    }
    return (
      `<tr>
        <td style="text-align: center"><a href="${sub.link || 'https://git.generalassemb.ly'}">${sub.name}</a></td>
        <td style="background: ${completionStyle}; text-align: center;">${sub.completion}</td>
      </tr>`
    );
  }).join('')
);

const template = (user) => `
    <img src="https://ga-core.s3.amazonaws.com/production/uploads/program/default_image/5593/thumb_GA_COG-01.png"/>
    <p>Hello ${user.name}!</p>
    <p>Below is a summary of your overall latenesses, absences and homework completion.</p>
  
    <h4>Total Absences: ${user.absences}</h4>

    <h4>HW Completion: ${user.percentage} 
    <table>
      <tr>
        <th>Homework / Repo</th>
        <th>Completion</th>
      </tr>
      ${formattedSubmissions(user.submissions)}
    </table>

    <h3>What does this mean?</h3>
    <p>3 unexcused latenesses === 1 absence (or .33 absence). If you have more than 3 absences, you are disqualified from course completion and outcomes support.</p>

    <p>If your overall HW completion is currently:</p>

    <p>a) Above 83%, you’re in great standing! Keep up the great work!</p>

    <p>b) Between 80-83%, you’re also in good standing and keep up the great work! However, do keep in mind, you’re sitting on the edge of dropping below 80% if you miss a couple of assignments in the remaining weeks.</p>
  
    <p>c) Below 80%, keep up the good work but you need to catch up! As per GA requirements, below 80% for hw completion does not qualify you for both the completion certificate and post-course outcomes support from your career coach. Please reach out to your IAs and let’s get you caught up!</p>
  `;

module.exports = template;
