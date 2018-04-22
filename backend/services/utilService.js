module.exports = function () {
  return {

// Description: Checks if user email is vaild
// Params:
// Param 1:  email.
// Returns: boolean
    isEmailValid:  function(email) {
      var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      return re.test(email);
    },
  };
};
