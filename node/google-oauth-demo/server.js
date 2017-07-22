var googleOAuth = require('google-oauth')({
  googleClient: process.env['GOOGLE_CLIENT'],
  googleSecret: process.env['GOOGLE_SECRET'],
  baseURL: 'http://localhost',
  loginURI: '/login',
  callbackURI: '/callback',
  scope: 'user' // optional, default scope is set to user 
})
 
require('http').createServer(function(req, res) {
  if (req.url.match(/login/)) return googleOAuth.login(req, res)
  if (req.url.match(/callback/)) return googleOAuth.callback(req, res)
}).listen(80)
 
googleOAuth.on('error', function(err) {
  console.error('there was a login error', err)
})
 
googleOAuth.on('token', function(token, serverResponse) {
  console.log('here is your shiny new google oauth token', token)
  serverResponse.end(JSON.stringify(token))
})