var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').createServer(app);
app.use(function(req, res, next)  {
  if (typeof (req.body) === 'string') {
    req.body = JSON.parse(req.body);
  }
  
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept,Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/api', function(req, res)  {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    status: 200,
    message: 'Service Status - OK',
  }));
});

// Routes(API)
app.use('/api/user', require('./backend/api/user'));
app.use('/api/auth', require('./backend/api/jwttoken'));
app.use('/api/project', require('./backend/api/project'));
app.set('port', process.env.PORT || 3001);

http.listen(app.get('port'));

module.exports = app;
