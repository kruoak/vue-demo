'use strict'

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const q = require('q')


const config = require('../../config')
const mysql = require('../../lib/mysql')(config)
const helper = require('../../lib/helper')

const router      = express.Router();
const sqlLog = "INSERT INTO bp_log (log_date, staff, module, data) VALUES(NOW(), :staff, :module, :data)"
const logAppend = function(staff, module, data) {
  const db = mysql.connect()
  return db.query(sqlLog, {
    staff,
    module,
    data:typeof data==='string' ? data : JSON.stringify(data)
  })
}
const toPackedArray = (rows) => {
  let out = {cols:[],rows:[]}
  if (rows.length == 0) {
    return out
  }
  for(let col in rows[0]) {
    out.cols.push(col)
  }
  rows.forEach((row) => {
    let row2 = []
    for (let i in row) {
      row2.push(row[i])
    }
    out.rows.push(row2)
  })
  return out
}
const genName = function(obj, nameMap) {
  let out = []
  nameMap = nameMap || {}
  for (let k in obj) {
    out.push((nameMap[k] || k) + '=' + obj[k])
  }
  return '(' + out.join(', ') + ')'
}
const genDiff = function(obj1, obj2) {
  let out = []
  for (let k in obj1) {
    if (obj1[k] != obj2[k]) {
      out.push(k + ':' + obj1[k] + ' => ' +obj2[k])
    }
  }
  if (out.length > 0) {
    return '(' + out.join(', ') + ')'
  }
  return null
}
const diffGen = function(before, after, nameMap) {
  const ins = []
  const del = []
  const upd = []
  console.log('BEFORE:', before)
  console.log('AFTER:', after)
  nameMap = nameMap || {}
  for(let k in before) {
    if (typeof after[k]==='undefined') {
      del.push(genName(before[k]))
    } else {
      if (typeof before[k]==='object') {
        let diff = genDiff(before[k], after[k])
        if (diff) {
          upd.push(k+':'+diff)
        }
      } else if (before[k] != after[k]) {
        upd.push(k + ':' + before[k] + ' => ' + after[k])
      }
    }
  }
  for (let k in after) {
    if (typeof before[k]==='undefined') {
      ins.push(genName(after[k]))
    }
  }
  const out = []
  if (ins.length > 0) {
    out.push('เพิ่ม ' + ins.join('\r\nเพิ่ม '))
  }
  if (del.length > 0) {
    out.push('ลบ ' + del.join('\r\nลบ '))
  }
  if (upd.length > 0) {
    out.push('แก้ไข ' + upd.join('\r\nแก้ไข '))
  }
  if (out.length == 0) {
    return '(ไม่มีการเปลี่ยนแปลง)'
  }
  return out.join('\r\n')
}

router.get('/', function(req, res) {
  res.send({
    status: true
  })
})

router.post('/getConfig', function(req, res) {
  let db = mysql.connect()
  let $scope = {
    config: {}
  }
  const getConfigs = () => {
    let sql = "SELECT name,value FROM bp_config "
      + "WHERE is_active='YES' "
      + "ORDER BY priority, name"
    return db.query(sql).then((rows) => {
      rows.forEach((row) => {
        $scope.config[row.name] = row.value
      })
    })
  }

  getConfigs().catch((err) => {
    $scope.error = err
  }).done(() => {
    if ($scope.error) {
      res.send({
        status:false,
        error: $scope.error
      })
      return
    }
    res.send({
      status:true,
      config: $scope.config,
    })
  })
})

router.post('/saveConfig', [bodyParser.json()], (req, res) => {
  console.log('saveConfig', req.body)
  let db = mysql.connect()
  let $scope = {
    before: {},
    error: null
  }

  const saveConfigs = () => {
    let all = []
    let sql = "UPDATE bp_config SET value=:value WHERE name=:name"
    for (let key in req.body.config) {
      all.push(db.query(sql, {name:key, value:req.body.config[key]}))
    }
    return q.all(all)
  }

  const getExistingConfig = () => {
    let list = []
    for (let k in req.body.config) {
      list.push(k)
    }
    let sql = "SELECT name, value FROM bp_config WHERE name IN ('"
      + list.join("','") + "')"
    return db.query(sql).then((rows) => {
      rows.forEach((row) => {
        $scope.before[row.name] = row.value
      })
    })
  }

  getExistingConfig().then(saveConfigs).catch((err) => {
    $scope.error = err;
  }).done(() => {
    if ($scope.error) {
      res.send({
        status:false,
        error: $scope.error
      })
      return
    }
    res.send({
      status:true
    })
    let diff = diffGen($scope.before, req.body.config)
    console.log('DIFF=', diff)
    logAppend(req.session.data.user.user, 'config', diff)
  })
})

/*
router.post('/getProductLimit', function(req, res) {
  const db = mysql.connect()
  const $scope = {
  }

  const getProductLimit = () => {
    let sql = "SELECT `id`, `code`, `limit` FROM product_limit ORDER BY `code`";
    return db.query(sql).then((rows) => {
      if (rows.length > 0) {
        $scope.limits = rows
      }
    })
  }

  getProductLimit().catch((err) => {
    $scope.error = err
  }).done(() => {
    if ($scope.error) {
      res.send({
        status: false,
        error: $scope.error
      })
      return
    }
    res.send({
      status:true,
      limits: $scope.limits
    })
  })
})
*/

router.post('/search-info', [bodyParser.json()], (req, res) => {
  const db = mysql.connect()
  const $scope = {
    codeType: req.body.codeType,
    code: req.body.code
  }

  const searchByMfgPool = () => {
    let sql = "SELECT subpool, COUNT(*) num_sample, MIN(exp_date) exp_date FROM sample_basket "
      + "WHERE mfgpool=:mfgpool "
      + "GROUP BY subpool ORDER BY subpool "
    return db.query(sql, {mfgpool: $scope.code})
  }

  const searchSample = () => {
    let sql = "SELECT sample, basket, subpool, subpool_ok, mfgpool, mfgpool_ok, exp_date /*, staff_basket, staff_subpool, staff_mfgpool */ "
      + "FROM sample_basket "
      + "WHERE " + $scope.codeType + " = :code "
      + "ORDER BY sample "
    return db.query(sql, {code: $scope.code})
  }

  const doSearch = () => {
    if ($scope.codeType==='mfgpool') {
      return searchByMfgPool()
    }
    return searchSample()
  }

  if (['sample','basket','subpool','mfgpool'].indexOf($scope.codeType) === -1) {
    res.send({
      status:false,
      error:'INVALID CODE TYPE'
    })
    return
  }
  doSearch().then((rows) => {
    $scope.result = rows;
  }).catch((e) => {
    $scope.error = e
  }).done(() => {
    if ($scope.error) {
      res.send({
        status: false,
        error: $scope.error
      })
      return
    }
    res.send({
      status: true,
      result: toPackedArray($scope.result)
    })
  })
})

router.post('/search-expire', [bodyParser.json()], (req, res) => {
  const db = mysql.connect()
  const $scope = {
    duration: parseInt(req.body.duration)
  }
  if (isNaN($scope.duration) || $scope.duration <= 0) {
    res.send({
      status:false,
      error:'INVALID DURATION'
    })
    return
  }

  const searchSample = () => {
    let sql = "SELECT sample, basket, subpool, mfgpool, exp_date, DATEDIFF(exp_date, NOW()) exp_in /*, staff_basket, staff_subpool, staff_mfgpool */ "
      + "FROM sample_basket "
      + "WHERE exp_date BETWEEN NOW() AND NOW() + INTERVAL "
      + $scope.duration + " DAY "
      + "ORDER BY sample "
      + "LIMIT 1000"
    return db.query(sql, {code: $scope.code})
  }


  searchSample().then((rows) => {
    $scope.result = rows;
  }).catch((e) => {
    $scope.error = e
  }).done(() => {
    if ($scope.error) {
      res.send({
        status: false,
        error: $scope.error
      })
      return
    }
    res.send({
      status: true,
      result: toPackedArray($scope.result),
      sql: $scope.sql
    })
  })
})

router.post('/getProductLimit', (req, res) => {
  const db = mysql.connect()
  const $scope = {

  }
  const getDefaultLimit = () => {
    let sql = "SELECT value FROM bp_config WHERE name='productDefaultLimit'"
    return db.query(sql).then((rows) => {
      if (rows.length > 0) {
        $scope.defaultLimit = rows[0].value
      }
    })
  }
  const getProductLimit = () => {
    let sql = "SELECT `code`, `limit` FROM product_limit ORDER BY code"
    return db.query(sql).then((rows) => {
      $scope.list = rows
    })
  }
  q.all([getProductLimit(), getDefaultLimit()]).catch((err) => {
    $scope.error = err
  }).done(() => {
    if ($scope.error) {
      res.send({
        status:false,
        error: $scope.error
      })
      return
    }
    res.send({
      status:true,
      defaultLimit: $scope.defaultLimit,
      list: $scope.list
    })
  })
})

router.post('/saveProductLimit', [bodyParser.json()], (req, res) => {
  // validate default limit
  const db = mysql.connect()
  const $scope = {
    before:{}
  }
  const saveDefaultLimit = () => {
    let sql = "UPDATE bp_config SET value=:value WHERE name=:name"
    return db.query(sql, {
      name: 'productDefaultLimit',
      value: req.body.defaultLimit
    })
  }
  const clearProductLimit = () => {
    let sql = "TRUNCATE TABLE product_limit"
    return db.query(sql)
  }
  const saveProductLimit = () => {
    let sql = "INSERT INTO product_limit (`code`, `limit`) VALUES "
      + req.body.list.map((item) => {
        return "('" + item.code + "','" + item.limit + "')"
      }).join(', ')
    return db.query(sql)
  }

  const getExisting = () => {
    return q.all([
      db.query("SELECT value FROM bp_config WHERE name='productDefaultLimit'").then((rows) => {
        $scope.before.defaultLimit = rows[0].value
      }),
      db.query("SELECT `code`, `limit` FROM product_limit").then((rows) => {
        rows.forEach((row) => {
          $scope.before[row.code] = {code:row.code, limit:row.limit}
        })
      })
    ])
  }

  getExisting().then(() => {
    return q.all([
      saveDefaultLimit(),
      clearProductLimit().then(saveProductLimit)
    ])
  }).catch((err) => {
    console.log('ERROR:', err)
    $scope.error = err
  }).done(() => {
    if ($scope.error) {
      res.send({
        status:false,
        error: $scope.error
      })
      return
    }
    res.send({
      status:true,
    })
    let after = {
      defaultLimit: req.body.defaultLimit
    }
    req.body.list.forEach((item) => {
      after[item.code] = {code:item.code, limit:item.limit}
    })
    let diffText = diffGen($scope.before, after)
    logAppend(req.session.data.user.user, 'productLimit', diffText)
  })
})

router.post('/logs', [bodyParser.json()], (req, res) => {
  const db = mysql.connect()
  const $scope = {}

  const getLogs = function() {
    let sql = "SELECT id, log_date, staff, module, data "
      + "FROM bp_log "
    let cond = []
    let param = {}
    if (req.body.staff) {
      cond.push('staff=:staff')
      param.staff = req.body.staff
    }
    if (req.body.module) {
      cond.push('module=:module')
      param.module = req.body.module
    }
    if (req.body.date) {
      cond.push('log_date >= :date AND log_date < :date + INTERVAL 1 DAY')
      param.date = req.body.date
    }
    if (req.body.keyword) {
      cond.push("data LIKE concat('%', :keyword, '%')")
      param.keyword = req.body.keyword
    }
    if (cond.length > 0) {
      sql += "WHERE " + cond.join(' AND ')
    }
    sql += " ORDER BY id DESC LIMIT 50"
    return db.query(sql, param).then((rows) => {
      $scope.rows = rows
    })
  }
  getLogs().catch((err) => {
    $scope.error = err
  }).done(() => {
    if ($scope.error) {
      res.send({
        status: false,
        error: $scope.error
      })
      return
    }
    res.send({
      status: true,
      result: toPackedArray($scope.rows)
    })
  })
});

router.post('/getSample', [bodyParser.json()], (req, res) => {
  const db = mysql.connect()
  const $scope = {
    sample:null
  }
  const getSample = () => {
    let sql = "SELECT * FROM sample_basket WHERE sample=:sample"
    return db.query(sql, {sample:req.body.sample}).then((rows) => {
      if (rows.length > 0) {
        $scope.sample = rows[0];
      }
    })
  }
  getSample().catch((err) => {
    $scope.error = err;
  }).then(() => {
    if ($scope.error) {
      res.send({
        status: false,
        error: $scope.error
      })
      return
    }
    res.send({
      status:true,
      sample: $scope.sample
    })
  })
});

router.post('/updateBasket1', [bodyParser.json()], (req, res) => {
  const db = mysql.connect()
  const $scope = {}
  const getSample = () => {
    let sql = "SELECT * FROM sample_basket WHERE sample=:sample"
    return db.query(sql, {sample:req.body.sample}).then((rows) => {
      if (rows.length > 0) {
        $scope.sample = rows[0];
      }
    })
  }
  const updateSampleBasket = () => {
    let sql = "UPDATE sample_basket SET basket=:basket WHERE id=:id"
    return db.query(sql, {basket: req.body.new_basket, id: $scope.sample.id})
  }

  getSample().then(updateSampleBasket).catch((err) => {
    $scope.error = err;
  }).then(() => {
    if ($scope.error) {
      res.send({
        status: false,
        error: $scope.error
      })
      return
    }
    res.send({
      status:true,
    })
    let diffText='แก้ไข SAMPLE#: ' + req.body.sample + ' FROM BASKET#: ' + $scope.sample.basket + ' TO ' + req.body.new_basket;
    logAppend(req.session.data.user.user, 'updBasket', diffText)
  })
});

router.post('/updateBasket2', [bodyParser.json()], (req, res) => {
  const db = mysql.connect()
  const $scope = {
    samples:[]
  }
  const getSamples = () => {
    let sql = "SELECT * FROM sample_basket WHERE basket=:basket"
    return db.query(sql, {basket:req.body.from_basket}).then((rows) => {
      if (rows.length > 0) {
        $scope.samples = rows;
      }
    })
  }
  const updateSamplesBasket = () => {
    if ($scope.samples.length==0) {
      return;
    }
    let sql = "UPDATE sample_basket SET basket=:basket WHERE id IN ("
      + $scope.samples.map((item) => item.id).join(',')
      + ")"
    return db.query(sql, {basket: req.body.to_basket})
  }

  getSamples().then(updateSamplesBasket).catch((err) => {
    console.log('error', err);
    $scope.error = err;
  }).then(() => {
    if ($scope.error) {
      res.send({
        status: false,
        error: $scope.error
      })
      return
    }
    res.send({
      status:true,
      numSamples: $scope.samples.length
    })
    if ($scope.samples.length > 0) {
      let diffText = 'แก้ไข BASKET#: ' + req.body.from_basket + ' TO ' + req.body.to_basket + '\r\n'
        + ' SAMPLE#: ' + $scope.samples.map(sample => sample.sample).join(', ');
      logAppend(req.session.data.user.user, 'updBasket2', diffText)
    }
  })
});


module.exports = router
