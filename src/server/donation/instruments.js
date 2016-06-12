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

router.post('/list', (req, res) => {
  const $scope = {}
  const db = mysql().connect()

  const getInstruments = () => {
    let sql = "SELECT b.id, b.name, b.mac_addr, b.last_date, "
      + "b.last_receptor_id r_id, r.name r_name, "
      + "b.last_floor_id f_id, f.name f_name, "
      + "b.last_location_id l_id, l.name l_name, b.last_rssi "
      + "FROM beacon b LEFT JOIN receptor r ON b.last_receptor_id=r.id "
      + "  LEFT JOIN floor f ON r.floor_id=f.id "
      + "  LEFT JOIN location l ON f.location_id=l.id "
      + "WHERE b.is_active='YES' ORDER BY b.last_date DESC, b.name"
    return db.query(sql).then((rows) => {
      $scope.list = rows
    })
  }

  getInstruments().then(() => {
    res.send({
      status:true,
      data:$scope.list
    })
  }).catch((e) => {
    res.send({
      status:false,
      error:e
    })
  })
})

router.post('/getSummaryMaster', (req, res) => {
  const $scope = {
    receptors:{}
  }
  const db = conn().connect()

  const getReceptors = () => {
    let sql = "SELECT r.id, r.uuid, r.name, r.detail, r.last_seen, r.map_x, r.map_y "
      + "FROM receptor r LEFT JOIN floor f ON r.floor_id=f.id "
      + "  WHERE r.is_active='YES'"
    return db.query(sql).then((rows) => {
      $scope.receptors = rows
    })
  }
  const getInstruments = () => {
    let sql = "SELECT b.id, b.name, b.mac_addr, b.last_date, "
      + "b.last_receptor_id r_id, r.name r_name, "
      + "b.last_floor_id f_id, f.name f_name, "
      + "b.last_location_id l_id, l.name l_name, b.last_rssi "
      + "FROM beacon b LEFT JOIN receptor r ON b.last_receptor_id=r.id "
      + "  LEFT JOIN floor f ON r.floor_id=f.id "
      + "  LEFT JOIN location l ON f.location_id=l.id "
      + "WHERE b.is_active='YES' ORDER BY b.last_date DESC, b.name"
    return db.query(sql).then((rows) => {
      $scope.instruments = rows
    })
  }

  q.all([getReceptors(), getInstruments()]).then(() => {
    res.send({
      status:true,
      receptors: $scope.receptors,
      instruments: $scope.instruments
    })
  }).catch((e) => {
    res.send({
      status:false,
      error:e
    })
  })
})

module.exports = router
