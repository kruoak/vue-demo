'use strict'

const express       = require('express');
const session       = require('express-session');
const path          = require('path');
const config        = require('./config');
const mysql         = require('./lib/mysql')(config);

const app           = express();
const MySQLStore    = require('connect-mysql')(session);


app.use(session({
  secret: config.session.secret,
  resave: true,
  saveUninitialized: true,
  rolling: true,
  cookie: {
    maxAge: 15*60*1000
  },
  store: new MySQLStore({
    pool: mysql.getPool(),
    cleanup: true
  })
}))


app.use(express.static(path.resolve(__dirname, 'public')))

app.use('/signon', require('./server/signon-app'))
app.use('/app', require('./server/app'))

app.get('/', function(req, res) {
  if (!req.session.data || !req.session.data.valid) {
    res.redirect('/signon');
    return;
  }
  res.redirect('/app');
});


app.listen(config.server.port, function() {
  console.log('READY', config.server.port)
})
