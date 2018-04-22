var express = require('express');
var ProjectService = require('../services/projectService')();
var router = express.Router();
var UserService = require('../services/userService')();
const {
    getUser,
    IsUserAdmin
} = require('../middlewares/user')();

// Route Description: Creating new Porject by authorized user. 
// Params: 
// Param 1: req.body -> {projectName}; req.headers-> {authorization} 
// Returns: 200: Project Details; 400: Error.

router.post('/project/create', getUser, IsUserAdmin, function (req, res) {
    var data = req.body;
    var userId = req.decoded.id;

    // Call UserService
    UserService.isAuthorized(userId, "project", "write").then(function (isAuthorized) {
        if (isAuthorized) {

            // Sanitize()
            if (!data.projectName) {
                return res
                    .status(400)
                    .send('Project name must be present.');
            }

            if (typeof data.projectName !== 'string') {
                return res
                    .status(400)
                    .send('Project name is not in string format.');
            }

            // Call ProjectService
            ProjectService
                .createProject(projectName, userId)
                .then(function (projectId) {
                    if (projectId) {
                        return res
                            .status(200)
                            .json(projectId);
                    }

                }, function (error) {
                    return res
                        .status(500)
                        .send('Server Error.');
                });
                
        } else {
            return res
                .status(401)
                .send('You are not authorized to access this page.');
        }

    }, function (error) {
        return res
            .status(500)
            .send('Server Error.');
    });

});

module.exports = router;