const compression = require('compression');
const express = require('express');
const app = express();

require('dotenv').config();

const port = process.env.PORT || 3001;

app.use(compression());

app.get('/', function(request, response){
  response.send('Hello world!');
});

app.listen(port, () => {
  console.log('[INFO] Server start listening on port ' + port);
});