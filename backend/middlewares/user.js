var jwtKey = require('../config/keys');
var jwt = require('jsonwebtoken');

module.exports = function () {
    return {

        // Description: Checking if user is authorized to access the page and
        //   decode jwt to get user data. Params: Param 1: req.headers-> {token}
        // Returns: 400: User is unauthorized since unauthorized token was present.
        getUser: function (req, res, next) {

            // Sanitize
            if (!req.headers['authorization']) {
                return res
                    .status(400)
                    .send('Token must be present.');
            }

            if (typeof req.headers['authorization'] !== 'string') {
                return res
                    .status(400)
                    .send('Token is not in string format.');
            }

            var data = req.headers['authorization'];

            var token = data.split(" ")[1];

            //Decode the token
            jwt.verify(token, jwtKey.jwtSecretKey, (err, decod) => {
                if (err) {
                    return res
                        .status(401)
                        .send('You are unauthorized to access the page.');
                } else {

                    req.decoded = decod;
                    next()
                }
            });
        },

        // Description: Checks if user is admin.
        //             
        // Params:
        // Param 1: req.params-> {projectId}; req.decoded-> {id}
        // Returns: 400: You are not authorized to add member to project. Only admin can add.; 500: Server Error
        IsUserAdmin: function (req, res, next) {
            var UserId = req.decoded.id;
            UserService.getRoles(UserId).then(function (roles) {
                for(var i=0; i< roles.length; i++){
                    if (roles[i] === 'admin') {
                        next()  
                    }
                }
                return res.status(400).send(`You are not allowed to add role to user. Only admin can add.`);

            }, function (error) {
                if (error.code === 400 && error.message) {
                    return res.status(400).send(error.message);
                  }
                return res.status(500).send('Server Error.');
            });

        },


        
    }
}
