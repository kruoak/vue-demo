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
    let sql = "DELETE FROM category_type WHERE code=:code";
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

router.post('/list', [], (req, res) => {
  const db = mysql.connect();
  const scope = {
  };
  const getData = () => {
    let sql = "SELECT code, name FROM category_type ORDER BY code";
    return db.query(sql).then((rows) => {
      scope.rows = rows;
    });
  }
  getData().catch((err) => {
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
      list: scope.rows
    })
  })
});

router.post('/save', [bodyParser.json()], (req, res) => {
  console.log(req.body);
  const db = mysql.connect();
  const scope = {};

  const saveData = () => {
    let sql = `
INSERT INTO category_type
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
