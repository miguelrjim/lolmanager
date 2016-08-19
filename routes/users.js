var express = require('express');
var router = express.Router();
var users = require('./../lib/users');

/* GET users listing. */
router.get('/', (req, res) => {
  res.send(users.getAll());
});

router.post('/add', (req, res) => {
  if(req.body.name && req.body.region) {
    users.add(req.body.name, req.body.region, req.body.username, req.body.password)
      .then(user => res.status(200).send(user), reason => res.status(400).send(reason))
  }
  else {
    res.status(400).send('Provide name and region');
  }
});

router.get('/:id/currentGame', (req, res) => {
  users.getCurrentGame(req.params.id)
    .then(result => res.status(200).send(result));
})

router.put('/:id/league', (req, res) => {
  users.getLeagues(req.params.id)
    .then(result => res.status(200).send(result[0]));
})

module.exports = router;
