const crypto = require('crypto');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const users = require('../users.json');

const tokenKey = process.env.TOKEN_KEY || false;

module.exports = function(app, db) {

  app.use((req, res, next) => {
    if (tokenKey && req.headers.authorization) {
      let tokenParts = req.headers.authorization.split(' ')[1].split('.');
      let signature = crypto
        .createHmac('SHA256', tokenKey)
        .update(`${tokenParts[0]}.${tokenParts[1]}`)
        .digest('base64');

      if (signature === tokenParts[2]) {
        req.user = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf8'));
      }
      next();
    }
    next();
  });
  

  app.post('/api/register', (req, res) => {
    if (req.body.username && req.body.password) {

      db.collection('Users').findOne({ username: req.body.username}, (error, result) => {
        if (error) return res.status(500).json({ status: 'ERROR', error });
        else {
          if (result) return res.status(200).json({ status: 'ERROR', message: 'User with this username already exists'});
          else {

            let password_hex = crypto
                .createHmac('SHA256', tokenKey)
                .update(req.body.password)
                .digest('hex');
            
            let newUser = {
              username: req.body.username,
              password: password_hex
            };

            db.collection('Users').insertOne(newUser, (error, result) => {
              if (error) return res.status(500).json({ status: 'ERROR', error });
              else if (result && result.ops && result.ops.length == 1) {

                let user = {
                  id: result.ops[0]._id,
                  username: result.ops[0].username
                };

                let head = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'jwt' })).toString('base64');
                let body = Buffer.from(JSON.stringify(user)).toString('base64');
                let signature = crypto
                  .createHmac('SHA256', tokenKey)
                  .update(`${head}.${body}`)
                  .digest('base64');

                return res.status(200).json({
                  status: 'SUCCESS',
                  message: 'User was created',
                  token: `${head}.${body}.${signature}`,
                  user
                });
              }
            });
          }
        }
      });
    } else {
      return res.status(404).json({ status: 'ERROR', message: 'Parameters are empty' });
    }
  });


  app.post('/api/auth', (req, res) => {
    for (let user of users) {
  
      if (req.body.login === user.login && req.body.password) {
        let password_hex = crypto
          .createHmac('SHA256', tokenKey)
          .update(req.body.password)
          .digest('hex');
  
        if (password_hex === user.password) {
          let head = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'jwt' })).toString('base64');
          let body = Buffer.from(JSON.stringify(user)).toString('base64');
          let signature = crypto
            .createHmac('SHA256', tokenKey)
            .update(`${head}.${body}`)
            .digest('base64');
    
          let result = {
            id: user.id,
            login: user.login,
            token: `${head}.${body}.${signature}`
          };
          return res.status(200).json(result);
        }
      }
    }
    return res.status(404).json({ message: 'User not found' });
  });

  app.get('/user', (req, res) => {
    console.log(req.user);
    if (req.user) return res.status(200).json(req.user);
    else return res.status(401).json({ message: 'Not authorized' });
  });

  app.get('/', function(request, response){
    response.send('Hello world!');
  });
}
