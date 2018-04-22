var mongoose = require('../config/db')();

module.exports = function () {
  var Schema = mongoose.Schema;
  var userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    resources: [{
      resource: String,
      accessTypes: Array // Array of objects; Each object has resource and access-type;
    }],
    roles: Array, // Array of roles.

    jwtRefreshToken: String,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  return mongoose.model('User', userSchema);
};