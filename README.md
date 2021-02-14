# GAIA

## What is GAIA?

__GAIA__ is a suite of tools for General Assembly SEI staff, to update the course tracker with homework status, to send out progress reports, to automate cloning repos for grading, and create other trackers for projects.

> But what do they _really_ do?

These programs access your course tracker from Google Sheets to do a number of things. Inside the `auth.js` file, we use Google OAuth to get access to your course tracker from your Google account. Afterwards, in the `students.js` file, your students' info is pulled from several sheets in your course tracker, and given to the other scripts in this folder.

Most of this toolkit is built in Node.js, apart from Git-Over-Here?


## So how can I get started?

There are a few quick conditions that need to be met before setting up.

1. All repositories in the Homework Tracker must be linked if you want them to be graded. Provide the same link you would give someone if they were to clone down the repo themselves (without the .git extension, e.g. https://git.generalassemb.ly/sei-nyc-pizza/making-friends). By the same extension, if you don't want a certain homework in the sheet to change, don't link it.
1. All students must have their GitHub enterprise usernames and e-mails in your course tracker.
1. You must have a generalassemb.ly e-mail.
1. You must have 2-step verification enabled.
1. You must have a working version of Node on your machine.
1. You must have a working installation of Homebrew (for `jq`).

## Well, what do I do?

Great question! Here are some set-up steps:

#### Get the Goods

Clone this repository onto your local machine. Once you have this repo cloned down, run `npm i`, and `brew install jq`. From then on, you can run `npm start` to set up your `config.json`. This will involve the following three steps:

1. First, you'll have to activate the Google Sheets API. You can do so by following the link in the CLI on your General Assembly Google Account. Enable the Google Sheets API, name the app "GAIA", select "Desktop app", download the client configuration, and add the file to the `setup` folder.
2. After adding your credentials, run `npm start` to set up your config.json, which will have (among others) the following things:
    - __name__: your first name (for signing e-mails)
    - __pronouns__: your pronouns (for signing e-mails)
    - __cohort__: your current cohort's Github organization (if your name is Pizza, then sei-nyc-pizza).
    - __emailUser__: your generalassemb.ly e-mail.
    - __emailPass__: an app password generated via your General Assembly e-mail account.
    - __token__: this will be a personal access token from Github, with both gist and repo permissions.
    - __courseTracker__: the id of your course tracker spreadsheet. If your spreadsheet's URL looks like `https://docs.google.com/spreadsheets/d/1OWV6mCdWV4pKIj8UaK89V7GF7gdhs87tHxeOHwp0NmA/edit#gid=122047201298`, you'll want to enter `1OWV6mCdWV4pKIj8UaK89V7GF7gdhs87tHxeOHwp0NmA`.
    - __curriculumRoadmap__: the id of your curriculum roadmap spreadsheet. If your spreadsheet's URL looks like `https://docs.google.com/spreadsheets/d/1OWV6mCdWV4pKIj8UaK89V7GF7gdhs87tHxeOHwp0NmA/edit#gid=122047201298`, you'll want to enter `1OWV6mCdWV4pKIj8UaK89V7GF7gdhs87tHxeOHwp0NmA`.
3. Finally, you can run `npm start` and select `status` to ensure that you are fully connected. If you are, you should see a console.table of your current cohort's information.

## So I've set up. What can I do?

__GAIA__ comes with a number of tools for TAs, IAs, ILs, and homework graders alike. The CLI can be accessed by running `npm start`. The tools are as follows:

### Git Over Here

__Git Over Here__ is a shell script that allows you to clone down a large amount of repos at once, based on pull requests. This is the only non-Node.js part of this project, and as such requires an installation (via `brew`) of `jq`, a shell JSON parser. 

To work with __Git Over Here__:

```shell
cd git-over-here
./main.sh
```

In addition, if you want to keep a running list of repos to pull from instead of entering them at the menu prompt, you can add them to `git-over-here/lunch.txt`, and separate the names with new lines or spaces. To use this file as a reference, add the `-l` or `--lunch` flag.

```shell
cd git-over-here
./main.sh --lunch
```

### GHOST (Get Homework Onto Spreadsheet Tool)

__GHOST__ is a script that reads the GitHub Enterprise API for existing pull requests on all repos listed in the __HW Completion__ tab of the course tracker. Based on the status of these pull requests the sheet is filled with their completion status (either Missing, Incomplete, or Complete). To use, add a column to the homework tracker, and link the GitHub Enterprise repository for a given assignment.

To use this script, run `npm start` and select `ghost`.

This script can be run as a test, by answering "Yes" to the test option. If selected, __GHOST__ will tell you how many assignments in the tracker are eligible for updates.

### Mailed It!

__Mailed It!__ is a script that reads the course tracker for homework completion and sends students a progress report based on their completion. 

To use this script, run `npm start` and select `mailedit`.

This script can be run as a test, by answering "Yes" to the test option. If selected, __Mailed It__  will send you a sample progress report from the first enrolled student on your course tracker.

### Wiki

__Wiki__ will create a wiki for you based on your current cohort's curriculum roadmap.

To use this script, run `npm start` and select `wiki`.

### Projects

__Projects__ is a script that reads the course tracker to create a project tracking sheet with approval status and completion status for each student, and creates a gist on the user's account for each student's feedback.

To use this script, run `npm start` and select `projects`.

### Feedback

__Feedback__ is a script that reads the project tracker created above and sends out the feedback in e-mail form to each student.

To use this script, run `npm start` and select `feedback`.

This script can be run as a test, by answering "Yes" to the test option. If selected, __Feedback__ will send you a sample feedback e-mail from the first student on your project tracker.

### Update

__Update__ will ask you for your new cohort name, new course tracker spreadsheet id, and new curriculum roadmap to keep you moving between cohorts.

To use this script, run `npm start` and select `update`.

#### Read the manual!

To get more information on the homework tracker, run `npm start` and select `help` to get more information.

## Troubleshooting

This repo should be an ongoing project that evolves as the dependencies for the curriculum evolve alongside it. Feel free to add issue tickets and repair / reconstruct files yourself.

#### GHOST

Generally speaking, errors from __GHOST__ come from inaccuracy in spelling GitHub usernames. If you're getting an error, make sure all GitHub usernames are properly capitalized.

#### Mailed It!

If you receive an error, it is most likely due to the way a student's e-mail is spelled, or because the e-mail or password entered into the `config.json` file are incorrect.

## Acknowledgments

Thanks to Andre Pato (@anpato) for the base code for the mailer, as well as the pooled connection, to Jordan Cruz-Correa (@jordancruz) for improving the update feature, to Zulay Scottborgh (@zumariposa) and Shay Kelly (@shayk) for helping with updated link features and the wiki.
