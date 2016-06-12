'use strict'

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const q = require('q')

const config = require('../../config');
const mysql = require('../../lib/mysql')(config);
const helper = require('../../lib/helper')

const router      = express.Router();

//router.use('/bangpha', require('./bangpha'));

router.get('/', (req, res) => {
  res.send({
    status:true
  })
});

router.post('/del', [bodyParser.json()], (req, res) => {
  const db = mysql.connect();
  const scope = {
  };

  // TODO: check dependencies

  const delData = () => {
    let sql = "DELETE FROM site_type WHERE code=:code";
    return db.query(sql, {code:req.body.code});
  }
  delData().catch((err) => {
    scope.error = err;
  }).done(() => {
    if (scope.error) {
      res.send({
        status:false,
        error: scope.error
      })
      return;
    }
    res.send({
      status:true,
    })
  })
});

router.post('/search', [bodyParser.json()], (req, res) => {
  // TODO: validate
  if (false) {
    res.send({
      status:false,   
      error: 'ERROR'
    })
    return;
  }

  const db = mysql.connect();

  const $scope = {
  };

  const getData = () => {
    let cond = [];
    let param = {};
    if (req.body.code != '') {
      cond.push('code=:code');
      param.code = req.body.code;
    }
    if (req.body.name != '') {
      cond.push("name LIKE :name ");
      param.name = '%' + req.body.name + '%';
    }
    let sql = `
SELECT code, name FROM site_type
WHERE ${cond.join(' AND ')}
ORDER BY code
`;
    return db.query(sql, param).then((rows) => {
      $scope.rows = rows;
    });
  }

  getData().catch((err) => {
    $scope.error = err;
  }).done(() => {
    if ($scope.error) {
      res.send({
        status:false,
        error: $scope.error
      })
      return;
    }
    res.send({
      status:true,
      list: $scope.rows
    })
  })
});

router.post('/save', [bodyParser.json()], (req, res) => {
  console.log(req.body);
  const db = mysql.connect();
  const scope = {};

  const saveData = () => {
    let sql = `
INSERT INTO site_type
(code, name)
VALUES(:code, :name)
ON DUPLICATE KEY UPDATE name=VALUES(name)
`;
    return db.query(sql, req.body);
  }

  saveData()
  .catch((err) => {
    scope.error = err;
  })
  .done(() => {
    if (scope.error) {
      res.send({
        status: false,
        error: scope.error
      });
      return
    }
    res.send({
      status: true,
    });
  });
})

module.exports = router;
