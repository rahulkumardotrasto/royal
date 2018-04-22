var mongoose = require('../config/db')();

module.exports = function () {
  var Schema = mongoose.Schema;
  var projectSchema = new Schema({
    name: String,
    users: [{
      userId: String
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  return mongoose.model('Project', projectSchema);
};
