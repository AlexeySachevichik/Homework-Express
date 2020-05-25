const services = require('../services');

module.exports = function(app, db) {
  
  app.post('/api/authorization', (request, response) => {

    if (request.user && request.user.id && request.user.username) {
      return response.status(200).json({ status: 'ERROR', message: 'The user is authenticated by the system'});
    
    } else {
      if (request.body && request.body.username && request.body.password && request.body.fingerprint) {

        db.collection('Users').findOne({ username: request.body.username}, (error, result) => {
          if (error) return res.status(500).json({ status: 'ERROR', error });
          else {
            if (!result) return response.status(200).json({ status: 'ERROR', message: 'There is no user with this username'});
            else {
              let password_hex = services.generatePasswordHex(request.body.password);
              if (!password_hex) return response.status(500).json({ status: 'ERROR', message: 'The system failed to encrypt the password'});
              else {
                if (result.password !== password_hex) {
                  return response.status(200).json({ status: 'ERROR', message: 'Wrong password'});
                } else {

                  let user = {
                    id: result._id,
                    username: result.username
                  };
  
                  let token = services.generateJWT(user, request.body.fingerprint);
                  if (!token) return response.status(500).json({ status: 'ERROR', message: 'The system failed to generate the token'});
                  else {
                    return response.status(200).json({
                      status: 'SUCCESS',
                      message: 'Authorization was successful',
                      token,
                      user
                    });
                  }
                }
              }
            }
          }
        });

      } else {
        return response.status(404).json({ status: 'ERROR', message: 'Parameters are empty' });
      }
    }
  });

};
