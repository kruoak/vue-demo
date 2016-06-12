'use strict'

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const q = require('q')


const config = require('../../config')
const mysql = require('../../lib/mysql')(config)
const helper = require('../../lib/helper')

const router      = express.Router();

router.get('/', function(req, res) {
  res.send({
    status: true
  })
})

router.post('/master', function(req, res) {
  let db = mysql.connect()
  let $scope = {
    status: true,
    donationUnit: [],
    donationCategory: [],
    bagType: [],
    donationUsage: []
  }
  const getDonationUnit = () => {
    let sql = "SELECT code, name FROM donation_unit WHERE is_active='YES' ORDER BY code"
    return db.query(sql).then((rows) => {
      $scope.donationUnit = rows
    })
  }
  const getDonationCategory = () => {
    let sql = "SELECT code, name, is_default FROM donation_category WHERE is_active='YES' ORDER BY code"
    return db.query(sql).then((rows) => {
      $scope.donationCategory = rows
    })
  }
  const getDonationUsage = () => {
    let sql = "SELECT code, name, is_default FROM donation_usage WHERE is_active='YES' ORDER BY code"
    return db.query(sql).then((rows) => {
      $scope.donationUsage = rows
    })
  }
  const getBagType = () => {
    let sql = "SELECT code, name, is_default FROM bag_type WHERE is_active='YES' ORDER BY code"
    return db.query(sql).then((rows) => {
      $scope.bagType = rows
    })
  }
  const getIdType = () => {
    let sql = "SELECT code, name, is_default FROM bag_type WHERE is_active='YES' ORDER BY code"
    return db.query(sql).then((rows) => {
      $scope.idType = rows
    })
  }

  let all = [
    getDonationUnit(),
    getDonationCategory(),
    getDonationUsage(),
    getBagType(),
    getIdType()
  ]

  q.all(all).catch((e) => {
    $scope.status = false
    $scope.error = e
  }).done(() => {
    if (!$scope.status) {
      res.send({
        status:false,
        error: $scope.error
      })
    } else {
      res.send({
        status:true,
        donationUnit: $scope.donationUnit,
        donationUsage: $scope.donationUsage,
        donationCategory: $scope.donationCategory,
        bagType: $scope.bagType,
        idType: $scope.idType
      })
    }
  })
})

router.post('/list', function(req, res) {
  res.send({
    status:true
  })
})

module.exports = router
