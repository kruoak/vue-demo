'use strict'

const express = require('express')
const router      = express.Router();

router.use('/site-type', require('./site-type'));
router.use('/category-type', require('./category-type'));
router.use('/method-type', require('./method-type'));

router.get('/', (req, res) => {
  res.send({
    status:true
  })
});

module.exports = router
