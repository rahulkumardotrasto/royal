var express = require('express');
var router = express.Router();
var UserService = require('../services/userService')();

// Route
// Description: reset refresh token and access token.
// Params:
// Param 1: req.body-> {refreshToken};
// Returns: 400: Error; 500: Server Error; 200: {
//                                                   jwtAccessToken: token.accessToken,
//                                                   jwtRefreshToken: token.refreshToken,
//                                               }
router.post('/token', function (req, res) {

    var jwtRefreshToken = req.body.refreshToken;

    UserService.getNewAccessAndRefreshToken(jwtRefreshToken).then(function (token) {

        var tokenData = {
            jwtAccessToken: token.accessToken,
            jwtRefreshToken: token.refreshToken,
        };
        return res.status(200).json(tokenData);

    }, function (error) {
        if (error.code === 401 && error.message) {
            res.status(401).send(error.message);
        }

        res.status(500).send('Server Error.');
    });

});

module.exports = router;
