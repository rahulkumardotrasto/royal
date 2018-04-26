var express = require('express');
var UserService = require('../services/userService')();
var jwtKey = require('../config/keys');
var jwt = require('jsonwebtoken');
var router = express.Router();
const {
  getUser,
  IsUserAdmin
} = require('../middlewares/user')();

// Route
// Description: signup function for new user
// Params:
// Param 1: req.body-> {email, password, confirm_password, name }
// Returns: 400: Error; 500: Server Error; 200: user: {
//                          id: id,
//                          name: name
//                          },
//                            tokens: {
//                                     jwtAccessToken: `${jwt.sign(userObj, jwtKey.jwtSecretKey, { expiresIn: 86400 })}`,
//                                     jwtRefreshToken: user.jwtRefreshToken,
//                          },
router.post('/signup', function (req, res, next) {
  var data = req.body;

  // Sanitize
  if (!data.email) {
    return res.status(400).send('Email must be present.');
  }

  if (typeof data.email !== 'string') {
    return res.status(400).send('Email is not in string format.');
  }

  if (!data.password) {
    return res.status(400).send('Password must be present.');
  }

  if (typeof data.password !== 'string') {
    return res.status(400).send('Password is not in string format.');
  }

  if (!data.confirm_password) {
    return res.status(400).send('Confirm password must be present.');
  }

  if (typeof data.confirm_password !== 'string') {
    return res.status(400).send('Confirm password is not in string format.');
  }

  if (data.confirm_password !== data.confirm_password) {
    return res.status(400).send('Password and Confirm password are not same.');
  }

  if (!data.name) {
    return res.status(400).send('Name must be present.');
  }

  if (typeof data.name !== 'string') {
    return res.status(400).send('Name is not in string format.');
  }

  // Call the UserService.
  UserService.signup(data).then(function (response) {

    var user = response.user;
    var userId = user._id;
    var name = data.name;
    var email = data.email;

     // create access token and refresh token.
      var userObj = {
        id: user._id,
      };

      var tokenData = {
        user: {
          id: userId,
          name: name
        },
        tokens: {
          jwtAccessToken: `${jwt.sign(userObj, jwtKey.jwtSecretKey, { expiresIn: 86400 })}`,
          jwtRefreshToken: user.jwtRefreshToken,
        },
      };

      return res.status(200).json(tokenData);
      
  }, function (error) {

    if (error.code === 400 && error.message) {
      return res.status(400).send(error.message);
    }

    return res.status(500).send('Server Error.');
  });
});

// Route
// Description: login function for  user
// Params:
// Param 1: req.body-> {email, password }
// Returns: 400: Error; 500: Server Error; 200: user: {
//                          id: id,
//                          name: name
//                          },
//                            tokens: {
//                                     jwtAccessToken: `${jwt.sign(userObj, jwtKey.jwtSecretKey, { expiresIn: 86400 })}`,
//                                     jwtRefreshToken: user.jwtRefreshToken,
//                           }
router.post('/login', function (req, res) {
  var data = req.body;

  // Sanitize
  if (!data.email) {
    return res.status(400).send('Email must be present.');
  }
  if (typeof data.email !== 'string') {
    return res.status(400).send('Email is not in string format.');
  }

  if (!data.password) {
    return res.status(400).send('Password must be present.');
  }

  if (typeof data.password !== 'string') {
    return res.status(400).send('Password is not in string format.');
  }

  // Call the UserService
  UserService.login(data.email, data.password).then(function (user) {
    var user = user.user;

    var userId = user._id;
    var userObj = {
      id: user._id,
    };
    var tokenData = {
      user: {
        id: userId,
        name: user.name
      },
      // create access token and refresh token.
      tokens: {
        jwtAccessToken: `${jwt.sign(userObj, jwtKey.jwtSecretKey, { expiresIn: 86400 })}`,
        jwtRefreshToken: user.jwtRefreshToken,
      },
    };
    return res.status(200).json(tokenData);

  }, function (error) {
    return res.status(500).send('Server Error.');
  });

}, function (error) {
  if (error.code === 400 && error.message) {
    return res.status(400).send(error.message);
  }
  return res.status(500).send('Server Error.');
});

// Route
// Description: Adding role to a particular user by Admin.
// Params:
// Param 1: req.body-> {userId, roles: [role]};
// Returns: 400: Error; 500: Server Error; 200: {
//                                                   jwtAccessToken: token.accessToken,
//                                                   jwtRefreshToken: token.refreshToken,
//                                               }
router.post('/role/:userId', getUser, IsUserAdmin, function (req, res) {
  var data = req.body;
  var userId = req.params.userId;
  var adminId = req.decoded.id;

  // Sanitize
  if (!data.role) {
    return res.status(400).send('Role must be present.');
  }

  if (typeof data.role !== 'string') {
    return res.status(400).send('Role is not in string format.');
  }

  // Call the UserService
  UserService.addRole(userId, data.role).then(function (response) {

    return res.status(200).send("Role successfully assigned to user.");

  }, function (error) {
    return res.status(500).send('Server Error.');
  });


});

// Route
// Description: Removing role to a particular user by admin.
// Params:
// Param 1: req.body-> {userId, roles: [role]};
// Returns: 400: Error; 500: Server Error; 200: {
//                                                   jwtAccessToken: token.accessToken,
//                                                   jwtRefreshToken: token.refreshToken,
//                                               }
router.delete('/:role/:userId', getUser, IsUserAdmin, function (req, res) {
  var role = req.params.role;
  var userId = req.params.userId;

  // Call the UserService
  UserService.removeRole(userId, role).then(function (response) {

    return res.status(200).send("Role successfully removed from user.");

  }, function (error) {
    return res.status(500).send('Server Error.');
  });

});

// Route
// Description: Adding accessTypes and resource to a user by admin.
// Params:
// Param 1: req.body-> {accessTypes, resource};
// Returns: 400: Error; 500: Server Error; 200: {
//                                                   jwtAccessToken: token.accessToken,
//                                                   jwtRefreshToken: token.refreshToken,
//                                               }
router.post('/resource/:userId', getUser, IsUserAdmin, function (req, res) {
  var data = req.body;
  var userId = req.params.userId;
  // Sanitize

  if (!data.accessTypes) {
    return res.status(400).send('Roles must be present.');
  }

  if (typeof data.accessTypes !== 'object') {
    return res.status(400).send('Role is not in string format.');
  }

  if (!data.resource) {
    return res.status(400).send('Roles must be present.');
  }

  if (typeof data.resource !== 'string') {
    return res.status(400).send('Role is not in string format.');
  }

  // Call the UserService
  UserService.addResource(userId, data).then(function (response) {

    return res.status(200).send("User successfully assigned resource with access types.");

  }, function (error) {
    return res.status(500).send('Server Error.');
  });

});

module.exports = router;
