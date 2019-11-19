# GHOST && Mailed It!

![https://media.giphy.com/media/l0HU2sYgCZh3HiKnS/giphy.gif](https://media.giphy.com/media/l0HU2sYgCZh3HiKnS/giphy.gif)

## What are these things in large font?

__GHOST__ and __Mailed It!__ are two programs for General Assembly SEI IAs, to update the course tracker with homework status, as well as to send out progress reports.

> But what do they _really_ do?

These programs access your course tracker from Google Sheets to do a number of things. Inside the `auth.js` file, we use Google OAuth to get access to your course tracker from your Google account. Afterwards, in the `students.js` file, your students' info is pulled from several sheets in your course tracker, and given to the two other scripts in this folder, `ghost` and `mailer`. 

## So can I get started?

Probably! There are a few quick conditions that need to be met before setting up.

1. All repositories in the Homework Tracker must be linked if you want them to be graded. Provide the same link you would give someone if they were to clone down the repo themselves (without the .git extension, e.g. https://git.generalassemb.ly/sei-nyc-pizza/making-friends). By the same extension, if you don't want a certain homework in the sheet to change, don't link it.
1. All students must have their GitHub enterprise usernames and e-mails in your course tracker.
1. You must set up Git Over Here beforehand, as this suite uses the GitHub personal access token for the GitHub API.

## Well, what do I do?

Great question! Here are some set-up steps:

#### Get the Goods

Fork and clone this repository onto your local machine. Once you have this repo cloned down, run `npm i`. From then on, you can run `npm run setup` as an additional reference for setting this application up. If you've followed the steps in this tutorial properly, executing that script should inform you that `you're all ready to go`.

#### Working with the Google Sheets API v4

![Node.js quickstart](https://media.git.generalassemb.ly/user/17021/files/0a9ee280-002b-11ea-9b43-acfd15427556)


To get access to your Google Sheets, you need to enable the Google Sheets API on your General Assembly e-mail account. [If you visit the Node.js quickstart tutorial for the Google Sheets API](https://developers.google.com/sheets/api/quickstart/nodejs?authuser=3), you can enable it via their Step 1. After enabling this, you'll be able to download the credentials as a file called `credentials.json`. Save this file into this directory, and you'll be able to access your spreadsheets.

#### App Passwords && 2-Factor Authentication for Mailed It!

__If haven't set up 2-Factor Authentication for your General Assembly e-mail, do so now.__

We need to create a special app password that __Mailed It!__ can use to email your students. Go to `https://myaccount.google.com/` on your General Assembly e-mail, and go to the Security panel. Scroll down to the `Signing in to Google` card, and click on App passwords. Generate an app password and save it into your `.env` file as `EMAILPASS`.

#### Other .env Variables

Obtain your course tracker spreadsheet ID, and save it to your `.env` file as `SPREADSHEETID`.

Obtain your personal access token from Git Over Here, and save it your `.env` file as `TOKEN`.

Save your General Assembly e-mail address in your `.env` file as `EMAILUSER`.

#### token.json

In this folder, run `npm run auth`. This will use OAuth to sign in to Google Sheets under your General Assembly e-mail. Follow the link that it provides, and copy the code back into the terminal. This will create your token for your Google account.

## I'm done setting up. Now what?

Now that you have your resources set up, you can run `npm run ghost` to update your homework tracker, and `npm run mailedit` to update your students on their progress. It is recommended to run __GHOST__ before __Mailed It!__ for the most updated homework results. If you'd like to run both, you can use `npm run all`. 

## Troubleshooting

This repo should be an ongoing project that evolves as the dependencies for the curriculum evolve alongside it. Feel free to add issue tickets and repair / reconstruct files yourself.

#### GHOST

Generally speaking, errors from __GHOST__ come from inaccuracy in spelling GitHub usernames. If you're getting an error, make sure all GitHub usernames are properly capitalized.

#### Mailed It!

If you receive an error, it is most likely due to the way a student's e-mail is spelled, or because the e-mail or password entered into the `.env` file are incorrect.

## Acknowledgments

Thanks to Andre Pato (@anpato) for the base code for the mailer, as well as the pooled connection.
