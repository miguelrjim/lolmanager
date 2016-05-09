var express = require('express');
var router = express.Router();
var users = require('./../lib/users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(users.getAll());
});

router.post('/add', function(req, res, next) {
  users.add(req.body.name, req.body.region, req.body.username, req.body.password)
    .then(user => res.status(200).send(user), reason => res.status(400).send(reason))
})

module.exports = router;
