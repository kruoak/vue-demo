'use strict'

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const q = require('q')
const fs = require('fs')

const helper = require('../lib/helper')

const router      = express.Router();


const checkSession = function(req, res, next) {
  if (!req.session.data || !req.session.data.valid) {
    console.log('redirect...')
    res.redirect('/signon')
    return
  }
  next()
}

const checkSessionApi = function(req, res, next) {
  if (!req.session.data || !req.session.data.valid) {
    res.send({status:false,session:false})
    return
  }
  next()
}

http://localhost/app/
router.get('/', [checkSession], function(req, res) {
  console.log('request /app')
  fs.readFile(path.resolve(__dirname, 'views/index.html'), 'utf8', function(err, data) {
    if (err) {
      res.send({status:false, error:err})
      return
    }
    let scripts = [
      '/js/core.js',
      '/js/vendors.js',
      '/js/pdfmake.min.js',
      '/js/vfs_fonts.js',
      '/js/xlsx.core.min.js',
      '/js/FileSaver.min.js',
      '/js/main.js'
    ]
    let scriptHtml = '<script src="'
      + scripts.join('"></script>\n<script src="')
      + '"></script>'
    data = data.replace('#SCRIPT#', scriptHtml)

    let css = [
      'css/ns-ui.min.css',
    ]
    let cssHtml = '<link rel="stylesheet" href="'
      + css.join('">\n<link rel="stylesheet" href="')
      + '">'
    data = data.replace('#CSS#', cssHtml)
    data = data.replace('#TITLE#', 'CLARET&reg;')
    res.send(data)
  })
})

router.use('/api/system', [checkSessionApi], require('./system'))
router.use('/api/donation', [checkSessionApi], require('./donation'))
router.use('/api/production', [checkSessionApi], require('./production'))
router.use('/api/setting', [checkSessionApi], require('./setting'))
router.use('/api/bangpha', [checkSessionApi], require('./bangpha'))
router.use('/api/client', require('./client'))

module.exports = router;
