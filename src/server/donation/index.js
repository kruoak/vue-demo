'use strict'

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const q = require('q')

const mysql = require('../../lib/mysql')
const helper = require('../../lib/helper')

const donateRouter = require('./donate')

const router      = express.Router();

router.use('/donate', donateRouter);
router.get('/', (req, res) => {
  res.send({
    status:true
  })
})

module.exports = router
