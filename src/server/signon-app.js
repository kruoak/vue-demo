'use strict'

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const q = require('q')
const fs = require('fs')

const config = require('../config')
const mysql = require('../lib/mysql')(config)
const helper = require('../lib/helper')

const router      = express.Router();


router.get('/', function(req, res) {
  fs.readFile(path.resolve(__dirname, 'views/index.html'), 'utf8', function(err, data) {
    if (err) {
      res.send({status:false, error:err})
      return
    }
    let scripts = [
      '/js/core.js',
      '/js/vendors.js',
      '/js/signon.js',
    ]
    let scriptHtml = '<script src="'
      + scripts.join('"></script>\n<script src="')
      + '"></script>'
    data = data.replace('#SCRIPT#', scriptHtml)

    let css = [
    ]
    let cssHtml = '<link rel="stylesheet" href="'
      + css.join('">\n<link rel="stylesheet" href="')
      + '">'
    data = data.replace('#CSS#', cssHtml)
    data = data.replace('#TITLE#', 'CLARET&reg;')
    res.send(data)
  })
})

router.post('/api/session', function(req, res) {
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

router.post('/api/signin', [bodyParser.json()], function(req, res) {
  const $scope = {}
  const db = mysql.connect()

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
      if (req.body.hash != helper.md5(req.sessionID + $scope.user.pass_hash)) {
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
    console.log(e);
    res.send({
      status:false,
      error: e
    })
  })
});



module.exports = router;
