'use strict'

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const q = require('q')

const mysql = require('../../lib/mysql')
const helper = require('../../lib/helper')

const dummyRouter = require('./dummy')

const router      = express.Router()

router.use('/dummy', dummyRouter)

router.get('/', (req, res) => {
  res.send({
    status:true
  })
})

module.exports = router
