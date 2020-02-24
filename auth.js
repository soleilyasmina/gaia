/* eslint-disable no-console */
const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')

// scope for readonly
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

// where the token is saved
const TOKEN_PATH = 'token.json'

// acquiring a new token
const getNewToken = (oAuth2Client, callback) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  fs.writeFileSync('auth.txt', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  // Node-side readline for info
  rl.question('Enter the code from that page here: ', code => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error('Error while trying to retrieve access token', err)
      oAuth2Client.setCredentials(token)
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err1 => {
        if (err1) return console.error(err1)
        return console.log('Token stored to', TOKEN_PATH)
      })
      return callback(oAuth2Client)
    })
  })
}

// to authorize and grab secret
const authorize = async (credentials, callback) => {
  const {
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: redirectURIs
  } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectURIs[0]
  )

  // check if a token exists
  try {
    const token = fs.readFileSync(TOKEN_PATH)
    oAuth2Client.setCredentials(JSON.parse(token))
    return await callback(oAuth2Client)
  } catch (e) {
    console.log(e)
    return getNewToken(oAuth2Client, callback)
  }
}

module.exports = authorize
