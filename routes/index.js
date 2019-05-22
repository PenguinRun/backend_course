var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.json({
    say: 'hi',
    no: 'no'
  })
});

router.use('/',function (req, res, next) {
  const onTime = new Date()
  console.log(onTime)
  next()
})

router.post('/test', function(req, res, next) {
  console.log(req.body)
  res.json({
    result: req.body
  })
});

router.put('/test2', function(req, res, next) {
  console.log('hi, im put method.')
  console.log(req.body)
  res.json({
    result: req.body
  })
});

module.exports = router;
