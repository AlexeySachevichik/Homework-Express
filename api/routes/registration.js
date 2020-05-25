const services = require('../services');

module.exports = function(app, db) {
  
  app.post('/api/registration', (request, response) => {
    if (request.body && request.body.username && request.body.password && request.body.fingerprint) {
  
      db.collection('Users').findOne({ username: request.body.username}, (error, result) => {
        if (error) return response.status(500).json({ status: 'ERROR', error });
        else {
          if (result) return response.status(200).json({ status: 'ERROR', message: 'User with this username already exists'});
          else {
            let password_hex = services.generatePasswordHex(request.body.password);
            if (!password_hex) return response.status(500).json({ status: 'ERROR', message: 'The system failed to encrypt the password'});
            else {
              let newUser = {
                username: request.body.username,
                password: password_hex
              };
  
              db.collection('Users').insertOne(newUser, (error, result) => {
                if (error) return response.status(500).json({ status: 'ERROR', error });
                else if (result && result.ops && result.ops.length == 1) {
  
                  let user = {
                    id: result.ops[0]._id,
                    username: result.ops[0].username
                  };
  
                  let token = services.generateJWT(user, request.body.fingerprint);
                  if (!token) return response.status(500).json({ status: 'ERROR', message: 'The system failed to generate the token'});
                  else {
                    return response.status(200).json({
                      status: 'SUCCESS',
                      message: 'User was created',
                      token,
                      user
                    });
                  }
                }
              });
            }
          }
        }
      });
    } else {
      return response.status(404).json({ status: 'ERROR', message: 'Parameters are empty' });
    }
  });

};
