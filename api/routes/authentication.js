const services = require('../services');

module.exports = function(app, db) {

  app.use((request, response, next) => {
    if (request.headers.authorization && request.headers.fingerprint) {

      let tokenParts = request.headers.authorization.split(' ')[1].split('.');
      let head = services.parseBase64(tokenParts[0]);

      if (head && head.exp && head.exp < new Date().getTime()) {
        return response.status(200).json({ status: 'ERROR', message: 'The token has an expired date'});

      } else if (head && head.iss && head.iss != request.headers.fingerprint) {
        return response.status(200).json({ status: 'ERROR', message: 'Invalid user fingerprint is used'});

      } else if (head) {
        let signature = services.generateSignature(tokenParts[0], tokenParts[1]);

        if (signature && signature === tokenParts[2]) {
          request.user = services.parseBase64(tokenParts[1]);
        }
        next();
      }
    }
    next();
  });

}
