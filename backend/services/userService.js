var bcrypt = require('bcrypt');
var Q = require('q');
var constants = require('../config/constants.json');
var UserModel = require('../models/user')();
var util = require('./utilService.js')();
var randToken = require('rand-token');
var winston = require('winston');
var crypto = require('crypto');
var randToken = require('rand-token');
var jwt = require('jsonwebtoken');
var jwtKey = require('../config/keys');

module.exports = function () {
  return {

    //Description: signup function for new user.
    //Params: 
    //Param 1: data: User details.
    //Returns: promise.
    signup: function (data) {

      var name = data.name;
      var email = data.email;
      var password = data.password;

      //create a promise;
      var deffered = Q.defer();

      if (util.isEmailValid(email)) {
        this.getUserByEmail(email).then(function (user) {

          if (user) {
            var error = new Error('User already exists.');
            error.code = 400;
            deffered.reject(error);

          } else {
            var newUser = new UserModel();

            newUser.name = name;
            newUser.email = email;
            newUser.password = password;

            bcrypt.hash(password, constants.saltRounds).then(function (hash) {
              newUser.password = hash;

              // creating jwt refresh token
              newUser.jwtRefreshToken = randToken.uid(256);

              //save a user.
              newUser.save().then(function (user) {

                deffered.resolve(user);

              }, function (error) {
                winston.log('error', {
                  "error": String(error),
                  "stack": new Error().stack
                });
                deffered.reject(error);
              });

            }, function (error) {
              winston.log('error', {
                "error": String(error),
                "stack": new Error().stack
              });
              deffered.reject(error);
            });
          }

        }, function (error) {
          winston.log('error', {
            "error": String(error),
            "stack": new Error().stack
          });
          deffered.reject(error);
        });

      } else {
        var error = new Error('Email is not in valid format.');
        error.code = 400;
        deffered.reject(error);
      }
      //return a promise; 
      return deffered.promise;
    },

    //Description: login function to authenticate user.
    //Params: 
    //Param 1: email: User email.
    //Param 2: password: User password.
    //Returns: promise.
    login: function (email, password) {
      var deffered = Q.defer();

      if (util.isEmailValid(email)) {

        // find user if present in db.
        UserModel.find({
          email: email,
        }).then(function (users) {
          if (users.length === 0) {
            var error = new Error('User does not exist.');
            error.code = 400;
            deffered.reject(error);

          } else {
            var user = users[0];
            var encryptedPassword = user.password;
            bcrypt.compare(password, encryptedPassword).then(function (res) {
              if (res) {

                var response = {
                  user,

                };
                deffered.resolve(response);

              } else {
                var error = new Error('Password is incorrect.');
                error.code = 400;
                deffered.reject(error);
              }

            }, function (error) {
              winston.log('error', {
                "error": String(error),
                "stack": new Error().stack
              });
              deffered.reject(error);
            });
          }

        }, function (error) {
          winston.log('error', {
            "error": String(error),
            "stack": new Error().stack
          });
          deffered.reject(error);
        });

      } else {
        var error = new Error('Email is not in valid format.');
        error.code = 400;
        deffered.reject(error);
      }

      return deffered.promise;
    },

    //Description: Adding role of user.
    //Params:
    //Param 1: userId: User id ehose role is to be assigned.
    //Param 2: role: Role.
    //Returns: promise.
    addRole: function (userId, role) {
      var deferred = Q.defer();
      UserModel.findByIdAndUpdate(userId, {
        $push: {
          roles: role
        }
      }, {
        new: true
      }).then(function (res) {
        deferred.resolve(res);

      }, function (error) {
        winston.log('error', {
          "error": String(error),
          "stack": new Error().stack
        });
        deferred.reject(error);
      });
      return deferred.promise;
    },

    //Description: Removing role of user.
    //Params: 
    //Param 1: userId: user id whose role is to be removed.
    //Param 2: role: role.
    //Returns: promise.
    removeRole: function (userId, role) {
      var deferred = Q.defer();
      UserModel.findByIdAndUpdate(userId, {
        $pull: {
          roles: role
        }
      }, {
        new: true
      }).then(function (res) {
        deferred.resolve(res);

      }, function (error) {
        winston.log('error', {
          "error": String(error),
          "stack": new Error().stack
        });
        deferred.reject(error);
      });
      return deferred.promise;
    },

    //Description: Check if the user is authorized.
    //Params: 
    //Param 1: userId: User id.
    //Param 2: resourceName: Resorrce Name.
    //Param 3: accessType: Access Type.
    //Returns: promise.
    isAuthorized(userId, resourceName, accessType) {
      var deferred = Q.defer();
      var isAuthorized = false;
      UserModel.findById(userId).then(function (user) {
        for (var i = 0; i < user.resources.length; i++) {
          if (user.resources[i].resource == resourceName) {
            for (var j = 0; j < user.resources[i].accessTypes.length; j++) {
              if (user.resources[i].accessTypes[j] == accessType) {
                isAuthorized = true;
                break;
              }
            }
          }
        }
        if (isAuthorized) {
          deferred.resolve(true);
        } else {
          deferred.resolve(false);
        }

      }, function (error) {
        winston.log('error', {
          "error": String(error),
          "stack": new Error().stack
        });
        deferred.reject(error);
      });
      return deferred.promise;
    },

    //Description: add resources to user.
    //Params: 
    //Param 1: email: User email.
    //Param 2: password: User password.
    //Returns: promise.
    addResource(userId, data) {
      var deferred = Q.defer();
      var resource = {
        resource: data.resource,
        accessTypes: data.accessTypes
      };

      UserModel.findByIdAndUpdate(userId, {
        $push: {
          resources: resource
        }
      }, {
        new: true
      }).then(function (res) {
        deferred.resolve(res);

      }, function (error) {
        winston.log('error', {
          "error": String(error),
          "stack": new Error().stack
        });
        deferred.reject(error);
      });
      return deferred.promise;
    },

    //Description: Get new access token.
    //Params: 
    //Param 1:  refreshToken: Refresh token.
    //Returns: promise.
    getNewAccessAndRefreshToken: function (refreshToken) {
      var deferred = Q.defer();

      UserModel.find({
        jwtRefreshToken: refreshToken,
      }).then(function (users) {
        if (users.length === 0) {
          var error = new Error("Invalid Refresh Token");
          error.code = 401;
          deferred.reject(error);

        } else {
          var user = users[0];
          var userObj = {
            id: user._id,
          };
          accessToken = `${jwt.sign(userObj, jwtKey.jwtSecretKey, { expiresIn: 86400 })}`;
          var jwtRefreshToken = randToken.uid(256);
          user.jwtRefreshToken = jwtRefreshToken;
          user.save().then(function (user) {
            var token = {
              accessToken: accessToken,
              refreshToken: refreshToken
            }
            deferred.resolve(token);

          }, function (error) {
            winston.log('error', {
              "error": String(error),
              "stack": new Error().stack
            });
            deferred.reject(error);
          });
        }

      }, function (error) {
        winston.log('error', {
          "error": String(error),
          "stack": new Error().stack
        });
        deferred.reject(error);
      });

      return deferred.promise;
    },

  };
};
