const crypto = require('crypto');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const tokenKey = process.env.TOKEN_KEY || false;

const services = {

  generateSignature: function(header, payload) {
    if (!tokenKey || !header || !payload) return false;
    else {
      return crypto
        .createHmac('SHA256', tokenKey)
        .update(`${header}.${payload}`)
        .digest('base64') || false;
    }
  },

  generatePasswordHex: function(password) {
    if (!tokenKey || !password) return false;
    else {
      return crypto
        .createHmac('SHA256', tokenKey)
        .update(password)
        .digest('hex') || false;
    }
  },

  generateJWT: function(user, fingerprint) {
    if (!tokenKey || !user || !fingerprint) return false;
    else {
      let head = Buffer.from(JSON.stringify(
        {
          alg: 'HS256',
          typ: 'jwt',
          exp: new Date().getTime() + 1000 * 60 * 60 * 24 * 30,
          iss: fingerprint
        }
      )).toString('base64');

      let body = Buffer.from(JSON.stringify(user)).toString('base64');

      let signature = crypto
        .createHmac('SHA256', tokenKey)
        .update(`${head}.${body}`)
        .digest('base64') || false;
      
      if (head, body, signature) {
        return `${head}.${body}.${signature}`;
      } else return false;
    }
  },

  parseBase64: function(content) {
    if (!content) return false;
    else {
      try {
        return JSON.parse(Buffer.from(content, 'base64').toString('utf8')) || false;
      } catch(e) {
        return false;
      }
    }
  }
};

module.exports = services;
