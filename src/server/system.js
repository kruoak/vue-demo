'use strict'

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const q = require('q')

const mysql = require('../lib/mysql')
const helper = require('../lib/helper')

const router      = express.Router();

router.get('/', function(req, res) {
  res.send({
    status: true
  })
})

router.post('/session', function(req, res) {
  if (!req.session.data || !req.session.data.valid) {
    req.session.data = {
      valid:false
    }
  }

  res.send({
    status:true,
    session: {
      id: req.sessionID,
      data: req.session.data
    }
  })
})

router.post('/signin', [bodyParser.json()], function(req, res) {
  const $scope = {}
  const db = mysql().connect()

  const getUser = function() {
    let sql = "SELECT * FROM staff WHERE user=:user"
    return db.query(sql, {user: req.body.user}).then(function(rows) {
      if (rows.length == 0) {
        throw 'signin.err_invalid_user'
      }

      $scope.user = rows[0]

      if ($scope.user.is_active=='NO') {
        throw 'signin.err_user_inactive'
      }

      if (req.body.hash != helper.md5(req.sessionID + $scope.user.pass)) {
        throw 'signin.err_invalid_pass'
      }
    })
  }

  const updateLastLogin = () => {
    let sql = "UPDATE staff SET last_ip=:ip, last_login=NOW() WHERE id=:id"
    return db.query(sql, {ip:req.connection.remoteAddress, id:$scope.user.id})
  }

  // TODO: append log
  getUser().then(updateLastLogin).then(() => {
    delete $scope.user.pass
    req.session.data = {
      valid: true,
      user: $scope.user
    }
    res.send({
      status:true,
      session: {
        id: req.sessionID,
        data: req.session.data
      }
    })
  }).catch((e) => {
    res.send({
      status:false,
      error: e
    })
  })
})

router.post('/signout', function(req, res) {
  // TODO: append log

  req.session.data = {
    valid: false
  }

  res.send({
    status:true
  })
})

router.post('/ping', function(req, res) {
  res.send({
    status: true,
    sessionID: req.sessionID
  })
})

module.exports = router
