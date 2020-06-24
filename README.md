# GAIA: New and Improved!

## What are these things in large font?

__GAIA__ is a series for General Assembly SEI IAs and TAs, to update the course tracker with homework status, to send out progress reports, and to automate cloning repos for grading.

> But what do they _really_ do?

These programs access your course tracker from Google Sheets to do a number of things. Inside the `auth.js` file, we use Google OAuth to get access to your course tracker from your Google account. Afterwards, in the `students.js` file, your students' info is pulled from several sheets in your course tracker, and given to the two other scripts in this folder, `ghost` and `mailer`. More information regarding Git-Over-Here is within its manual.

## So can I get started?

Probably! There are a few quick conditions that need to be met before setting up.

1. All repositories in the Homework Tracker must be linked if you want them to be graded. Provide the same link you would give someone if they were to clone down the repo themselves (without the .git extension, e.g. https://git.generalassemb.ly/sei-nyc-pizza/making-friends). By the same extension, if you don't want a certain homework in the sheet to change, don't link it.
1. All students must have their GitHub enterprise usernames and e-mails in your course tracker.
1. You must set up Git Over Here beforehand, as this suite uses the GitHub personal access token for the GitHub API.

## Well, what do I do?

Great question! Here are some set-up steps:

#### Get the Goods

Fork and clone this repository onto your local machine. Once you have this repo cloned down, run `npm i`. From then on, you can run `npm run setup` as an additional reference for setting this application up.

#### Read the manual!

To get more information on the homework tracker, run `npm run help` to get more information. For Git-Over-Here, consult the manual, or `cd` into the folder and run `sh main.sh --help`.


## Troubleshooting

This repo should be an ongoing project that evolves as the dependencies for the curriculum evolve alongside it. Feel free to add issue tickets and repair / reconstruct files yourself.

#### GHOST

Generally speaking, errors from __GHOST__ come from inaccuracy in spelling GitHub usernames. If you're getting an error, make sure all GitHub usernames are properly capitalized.

#### Mailed It!

If you receive an error, it is most likely due to the way a student's e-mail is spelled, or because the e-mail or password entered into the `.env` file are incorrect.

## Acknowledgments

Thanks to Andre Pato (@anpato) for the base code for the mailer, as well as the pooled connection.
