module.exports = function(app, db) {

  require('./registration')(app, db);
  require('./authorization')(app, db);

};