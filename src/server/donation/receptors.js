'use strict'

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const q = require('q')

const mysql = require('../../lib/mysql')
const helper = require('../../lib/helper')

const router      = express.Router();

router.get('/', function(req, res) {
  res.send({
    status: true
  })
})

router.post('/list', function(req, res) {
  res.send({
    status:true
  })
})

module.exports = router
