var mongoose = require('mongoose');
var keys = require('./keys.js');

module.exports = function () {
  mongoose.connect(keys.dbURL);
  return mongoose;
};
