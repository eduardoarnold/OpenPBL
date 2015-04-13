var authenticationService = new (require('../services/AuthenticationService'))();
var Q = require ('q');

exports.post = function(req, res){

  var userEmail = req.body.email;
  var userPassword = req.body.password;

  authenticationService.authenticateUser(userEmail,userPassword)
    .then(function(authToken){
      
      res.status(200).send({ token : authToken });

    })
    .catch(function(errorMessage){
      res.send({
        success : false,
        reason: errorMessage
      });
    });

}
