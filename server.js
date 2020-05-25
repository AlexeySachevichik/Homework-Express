const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const compression = require('compression');
app.use(compression());

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const mongoUri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_SERVER}.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;


app.use((request, response, next) => {
  if (!process.env.TOKEN_KEY) {
    return res.status(500).json({ message: 'Token key not found' });
  }
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE');
  response.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

client.connect(function(err, client){
  if(err) return console.log(err);
  db = client.db("Users_db");

  app.listen(port, host, (error) => {
    if (error) {
      console.log('[ERROR] Error start server. \r\n' + error);
      return;
    }
  
    require('./api/app.js')(app, db);
    
    console.log(`[INFO] Server listens http://${host}:${port}`);
  });
});

process.on('SIGINT', () => {
  db.close();
  process.exit();
});
