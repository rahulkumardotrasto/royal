var ProjectModel = require('../models/project')();
var winston = require('winston');
var Q = require('q');

module.exports = function () {
    return {

        //Description: Create new project for authorized user.
        //Params: 
        //Param 1: projectName: Project name.
        //Param 2: userId: User Id.
        //Returns: promise
        createProject: function (projectName, userId) {
                        var deffered = Q.defer();
                        var newProject = ProjectModel();
                        newProject.name = projectName;
                        newProject.users = [{
                            userId: userId,
                        }];
                        
                        //save user
                        newProject.save().then(function (project) {
                            var productId = project._id;
                            deffered.resolve(productId);

                        }, function (error) {
                            winston.log('error', {
                                "error": String(error),
                                "stack": new Error().stack
                            });
                            deffered.reject(error);
                        });
                   
            //return a promise; 
            return deffered.promise;
        },
    };
};