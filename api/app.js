module.exports = function(app, db) {

  require('./routes/authentication')(app, db);

  require('./routes')(app, db);

  app.get('/user', (req, res) => {
    if (req.user) return res.status(200).json(req.user);
    else return res.status(401).json({ message: 'Not authorized' });
  });

  app.get('/', function(request, response){
    response.send('Hello world!');
  });

}
