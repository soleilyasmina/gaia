# GAIA

## What is GAIA?

__GAIA__ is a suite of tools for General Assembly SEI staff, to update the course tracker with homework status, to send out progress reports, to automate cloning repos for grading, and create other trackers for projects.

> But what do they _really_ do?

These programs access your course tracker from Google Sheets to do a number of things. Inside the `auth.js` file, we use Google OAuth to get access to your course tracker from your Google account. Afterwards, in the `students.js` file, your students' info is pulled from several sheets in your course tracker, and given to the two other scripts in this folder, `ghost` and `mailer`. More information regarding Git-Over-Here is within its manual.

## So how can I get started?

There are a few quick conditions that need to be met before setting up.

1. All repositories in the Homework Tracker must be linked if you want them to be graded. Provide the same link you would give someone if they were to clone down the repo themselves (without the .git extension, e.g. https://git.generalassemb.ly/sei-nyc-pizza/making-friends). By the same extension, if you don't want a certain homework in the sheet to change, don't link it.
1. All students must have their GitHub enterprise usernames and e-mails in your course tracker.
1. You must have a generalassemb.ly e-mail.
1. You must have 2-step verification enabled.
1. You must have a working version of Node on your machine.

## Well, what do I do?

Great question! Here are some set-up steps:

#### Get the Goods

Fork and clone this repository onto your local machine. Once you have this repo cloned down, run `npm i`. From then on, you can run `npm run setup` to set up your .env file. This will have the following key-value pairs:
- __COHORT__: Your cohort's Github organization (if your name is Pizza, then sei-nyc-pizza).
- __EMAILUSER__: Your generalassemb.ly e-mail.
- __EMAILPASS__: An app password generated via your General Assembly e-mail account.
- __SPREADSHEETID__: The id of your course tracker spreadsheet. If your spreadsheet's URL looks like `https://docs.google.com/spreadsheets/d/1OWV6mCdWV4pKIj8UaK89V7GF7gdhs87tHxeOHwp0NmA/edit#gid=122047201298`, you'll want to enter `1OWV6mCdWV4pKIj8UaK89V7GF7gdhs87tHxeOHwp0NmA`.
- __TOKEN__: This will be a personal access token from Github, with both gist and repo permissions.

## So I've set up. What can I do?

__GAIA__ comes with a number of tools for TAs, IAs, ILs, and homework graders alike. The tools are as follows:

### Git-Over-Here

__Git-Over-Here__ is a script that reads the GitHub API based on provided repo names and clones down all repos from open pull requests, to make cloning and installing automated. GOH is the only project that does not leverage the course tracker, so this requires your GitHub token (with repo and gist permissions) and your current cohort.

### GHOST (Get Homework Onto Spreadsheet Tool)

__GHOST__ is a script that reads the GitHub Enterprise API for existing pull requests on all repos listed in the __HW Completion__ tab of the course tracker. Based on the status of these pull requests the sheet is filled with their completion status (either Missing, Incomplete, or Complete).

### Mailed It!

__Mailed It!__ is a script that reads the course tracker for homework completion and sends students a progress report based on their completion. It's practical to run GHOST and Mailed It! sequentially, to get the most updated results to the students.

### Random

__Random__ is a script that picks a random student from the course tracker. It creates a local JSON file for listing out student names and past picks, to ensure that the picks are weighted.

### Projects

__Projects__ is a script that reads the course tracker to create a project tracking sheet with approval status and completion status for each student, and creates a gist on the user's account for each student's feedback.

### Feedback

__Feedback__ is a script that reads the project tracker created above and sends out the feedback in e-mail form to each student.

### Update

__Update__ will ask you for your new cohort name and new course tracker spreadsheet id, to keep you moving between cohorts.

#### Read the manual!

To get more information on the homework tracker, run `npm run help` to get more information.

## Troubleshooting

This repo should be an ongoing project that evolves as the dependencies for the curriculum evolve alongside it. Feel free to add issue tickets and repair / reconstruct files yourself.

#### GHOST

Generally speaking, errors from __GHOST__ come from inaccuracy in spelling GitHub usernames. If you're getting an error, make sure all GitHub usernames are properly capitalized.

#### Mailed It!

If you receive an error, it is most likely due to the way a student's e-mail is spelled, or because the e-mail or password entered into the `.env` file are incorrect.

## Acknowledgments

Thanks to Andre Pato (@anpato) for the base code for the mailer, as well as the pooled connection.
