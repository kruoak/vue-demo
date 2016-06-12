'use strict'

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const q = require('q')
const moment = require('moment')


const config = require('../../config')
const mysql = require('../../lib/mysql')(config)
//const oracle = require('../../lib/oracle')(config)
const oracle = null;

const helper = require('../../lib/helper')
const router      = express.Router();

router.get('/', (req, res) => {
  res.send({
    status:true
  })
})
//  /api/client/config
router.get('/config', (req, res) => {
  const $scope = {
    config:{},
    productLimit:{}
  }
  const db = mysql.connect()

  const getConfig = () => {
    let sql = "SELECT * FROM bp_config WHERE is_active='YES'"
    return db.query(sql).then((rows) => {
      rows.map((row) => {
        $scope.config[row.name] = row.value
      })
    })
  }
  const getProductLimit = () => {
    let sql = "SELECT * FROM product_limit ORDER BY code"
    return db.query(sql).then((rows) => {
      rows.forEach((row) => {
        $scope.productLimit["p_"+row.code] = row.limit
      })
    })
  }

  q.all([
    getConfig(),
    getProductLimit()
  ]).then(() => {

  }).done(() => {
    // console.log('config=', {
    //   status:true,
    //   config: $scope.config,
    //   productLimit: $scope.productLimit
    // })
    res.send({
      status:true,
      config: $scope.config,
      productLimit: $scope.productLimit
    })
  })
})

router.get('/hasBasket/:basket/:staff?', (req, res) => {
  console.log('hasBasket', req.params)
  const db = mysql.connect()
  const $scope = {
    error: false,
    hasBasket: false
  }
  const hasBasket = () => {
    let sql = "SELECT 1 FROM sample_basket WHERE basket=:basket LIMIT 1"
    return db.query(sql, {basket: req.params.basket}).then((rows) => {
      $scope.hasBasket = rows.length > 0
    })
  }
  const logHasBasket = () => {
    let sql = "INSERT INTO log_has_basket (log_date, staff, basket, has_basket) "
      +"VALUES(NOW(), :staff, :basket, :has_basket)"
    return db.query(sql, {
      staff: req.params.staff || '',
      basket: req.params.basket,
      has_basket: $scope.hasBasket ? 'YES' : 'NO'
    })
  }
  hasBasket().then(logHasBasket).catch((e) => {
    console.log('ERROR', e)
    $scope.error = true
  }).done(() => {
    if ($scope.error)  {
      res.send({
        status: false
      })
      return
    }
    res.send({
      status: true,
      hasBasket: $scope.hasBasket
    })
  })
})

router.get('/saveToBasket/:basket?/:sample?/:product?/:staff?', (req, res) => {
  console.log('saveToBasket', req.params)
  const db = mysql.connect()
  const $scope = {}

  const saveToBasket = () => {
    let sql = "INSERT INTO sample_basket (basket, sample, product, staff_basket) "
      + "VALUES(:basket, :sample, :product, :staff) "
      + " ON DUPLICATE KEY UPDATE staff_basket=VALUES(staff_basket)"
    return db.query(sql, {
      basket: req.params.basket,
      sample: req.params.sample,
      product: req.params.product,
      staff: req.params.staff || ''
    })
  }
  const updateExpireDate = () => {
    let sql = "SELECT stk_dtperemp AS exp_date FROM stock WHERE prel_no=:sample AND prodf_cd=:product"
    console.log(sql)
    return oracle.query($scope.oradb, sql, {
      sample: req.params.sample,
      product: req.params.product
    }).then((rows) => {
      console.log(rows)
      oracle.close($scope.oradb)
      if (rows.length == 0) {
        return
      }
      let sql = "UPDATE sample_basket SET exp_date=:exp_date WHERE basket=:basket AND sample=:sample "
      return db.query(sql, {
        basket: req.params.basket,
        sample: req.params.sample,
        exp_date: moment(rows[0].EXP_DATE).format('YYYY-MM-DD')
      })
    }).catch((e) => {
      console.log(e)
    })
  }
  saveToBasket().catch((e) => {
    console.log('error', e)
  }).then(() => {
    res.send({
      status:true
    })
    return oracle.connect().then((oradb) => {
      console.log('connected')
      $scope.oradb = oradb
    })
  }).then(updateExpireDate)
})

router.post('/uploadBasketFile/:file/:staff?', [bodyParser.text()], (req, res) => {
  const db = mysql.connect();
  const $scope = {
    error: false,
    list: req.body.trim().split(/\r\n/g).map((item) => {
      return item.split(',')
    }),
    samples: [],
    basketStatus: {},
    invalidBasket: []
  }
  let fname = req.params.file.split('\\')
  $scope.fname = fname.pop()

  const getSamples = () => {
    let sql = "SELECT sample AS s, product AS p, basket AS b, is_done AS x FROM sample_basket "
      + " WHERE basket IN ('"
      + $scope.list.map((item) => {
        return mysql.pq(item[0])
      }).join("','") + "')"
    return db.query(sql).then((rows) => {
      $scope.samples = rows
    })
  }

  const getSampleBasket = (sample) => {
    let sql = "SELECT basket FROM sample_basket WHERE sample=:sample"
    return db.query(sql, {sample})
  }

  const checkValidBasket = () => {
    let lookup = {}
    var all = []
    $scope.samples.forEach((item) => {
      lookup[item.s] = item.b
    })
    $scope.list.forEach((item) => {
      $scope.basketStatus[item[0]] = lookup[item[1]] && lookup[item[1]] == item[0]
      if (!$scope.basketStatus[item[0]]) {
        all.push(getSampleBasket(item[1]).then((rows) => {
          let b = 'NOT_FOUND'
          if (rows.length > 0) {
            b = rows[0].basket
          }
//          $scope.invalidBasket.push('B1='+item[0]+' S='+item[1]+' B2='+b)
          $scope.invalidBasket.push('เบอร์โลหิต '+item[1]+' ไม่ได้อยู่ที่ตะกร้า '+item[0]+' แต่อยู่ที่ '+b)

        }))
      }
    })
    console.log('BEFORE', $scope.samples.length)
    $scope.samples = $scope.samples.filter((item) => {
      return $scope.basketStatus[item.b]
    })
    console.log('AFTER', $scope.samples.length)
    return q.all(all)
  }

  const saveBasketFile = () => {
    let sql = "INSERT INTO basket_file (filename, basket, sample, is_valid, staff_upload) VALUES "
      + $scope.list.map((item) => {
        return "('" + mysql.pq($scope.fname) + "','"
          + mysql.pq(item[0]) + "', '" + mysql.pq(item[1]) + "','"
          + ($scope.basketStatus[item[0]] ? 'YES' : 'NO') + "','"
          + (req.params.staff||'') + "')"
      }).join(',')
      + " ON DUPLICATE KEY UPDATE sample=VALUES(sample), is_valid=VALUES(is_valid), staff_upload=VALUES(staff_upload)"
    return db.query(sql)
  }
  const updateSampleFile = () => {
    let sql = "UPDATE sample_basket SET file=:file "
      + " WHERE basket IN ('"
      + $scope.list.map((item) => {
        return mysql.pq(item[0])
      }).join("','") + "')"
    return db.query(sql, {file: $scope.fname})
  }

  getSamples()
    .then(checkValidBasket)
    .then(saveBasketFile)
    .then(updateSampleFile)
    .catch((e) => {
      $scope.error = true
      console.log('ERROR:', e)
    }).done(() => {
      if ($scope.error) {
        res.send({
          status:false
        })
        return
      }
      console.log('SAMPLES', $scope.samples, $scope.invalidBasket)
      res.send({
        status:true,
        samples:$scope.samples.filter((row) => {
          return row.x=='NO'
        }),
        invalidBasket: $scope.invalidBasket
      })
    })
})

router.get('/sampleStatus/:basket/:sample/:staff?', (req, res) => {
  console.log('sampleStatus', req.params)
  const db = mysql.connect();
  const $scope = {
  }

  const updateSampleStatus = () => {
    let sql = "UPDATE sample_basket SET is_done='YES' "
      + ", staff_file=:staff "
      + "WHERE basket=:basket AND sample=:sample"
    return db.query(sql, {
      basket: req.params.basket,
      sample: req.params.sample,
      staff: req.params.staff || ''
    })
  }
  updateSampleStatus().catch((e) => {
    $scope.error = true
    console.log('ERROR:', e)
  }).done(() => {
    if ($scope.error) {
      res.send({status:false})
      return
    }
    res.send({status:true})
  })
})

router.post('/sampleStatus/:basket/:sample/:staff?', [bodyParser.text()], (req, res) => {
  console.log('sampleStatus', req.params)
  const db = mysql.connect();
  const $scope = {
  }

  const updateSampleStatus = () => {
    let sql = "UPDATE sample_basket SET is_done='NO' "
      + ", staff_file=:staff "
      + ", last_error=:error "
      + "WHERE basket=:basket AND sample=:sample"
    return db.query(sql, {
      basket: req.params.basket,
      sample: req.params.sample,
      staff: req.params.staff || '',
      error: req.body || 'NO_ERROR'
    })
  }
  updateSampleStatus().catch((e) => {
    $scope.error = true
    console.log('ERROR:', e)
  }).done(() => {
    if ($scope.error) {
      res.send({status:false})
      return
    }
    res.send({status:true})
  })
})


router.get('/fileStatus/:file/:staff?', (req, res) => {
  console.log('fileStatus', req.params)
  const $scope = {
    list:[]
  }
  const db = mysql.connect()
  let fname = req.params.file.split('\\')
  $scope.fname = fname.pop()

  const getCompletedBasket = () => {
    let sql = "SELECT basket FROM sample_basket "
      + "WHERE  basket in ( "
      + "  SELECT basket FROM basket_file "
      + "  WHERE `filename`=:file ) "
      + "GROUP BY basket "
      + "HAVING sum(if(is_done='YES',1,0))=count(*)"
    return db.query(sql, {file: $scope.fname}).then((rows) => {
      $scope.list = rows.map((row) => {
        return row.basket
      })
    })
  }

  const updateFile = () => {
    if ($scope.list.length == 0) {
      return
    }
    let sql = "UPDATE basket_file SET is_done='YES' "
      + "WHERE filename=:file AND basket IN ('"
      + $scope.list.join("','") + "')"
    return db.query(sql, {
      file: $scope.fname
    })
  }
  getCompletedBasket().then(updateFile).catch((e) => {
    console.log('ERROR:', e)
    $scope.error = true
  }).done(() => {
    if ($scope.error) {
      res.send({status:false})
      return
    }
    res.send({status:true})
  })
})

router.get('/expandBasket/:basket', (req, res) => {
  const $scope = {
    error: false,
    list: []
  }
  const db = mysql.connect()

  const getSamples = () => {
    let sql = "SELECT sample FROM sample_basket "
      + "WHERE basket=:basket"
    return db.query(sql, {basket: req.params.basket}).then((rows) => {
      $scope.list = rows.map((row) => {
        return row.sample
      })
    })
  }

  getSamples().catch((e) => {
    $scope.error = true
    console.log('ERROR:', e)
  }).done(() => {
    if ($scope.error) {
      res.send({status:false})
      return
    }
    res.send({
      status:true,
      list: $scope.list
    })
  })
})

router.get('/savePool2/:type/:pool/:sample/:staff?', (req, res) => {
  console.log('savePool2', req.params);
  const db = mysql.connect();
  const $scope = {}
  const updatePool = () => {
    let fld1 = req.params.type=='mfg' ? 'mfgpool' : 'subpool';
    let fld2 = req.params.type=='mfg' ? 'subpool' : 'sample';
    let sql = "UPDATE sample_basket SET " + fld1 + "=:pool, " + fld1 + "_ok='NO' WHERE " + fld2 + "=:sample";
    console.log('SQL', sql, req.params.pool, req.params.sample);
    return db.query(sql, {
      pool: req.params.pool,
      sample: req.params.sample,
    })
  }
  updatePool().catch((err) => {
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
      status: true
    });
  })
});

router.post('/savePool/:type/:sample/:staff?', [bodyParser.text()], (req, res) => {
  console.log('savePool', req.params)
  console.log(req.body)
  const db = mysql.connect()
  const $scope = {}

  let fld1 = req.params.type=='mfg' ? 'mfgpool' : 'subpool'
  let fld2 = req.params.type=='mfg' ? 'staff_mfgpool' : 'staff_subpool'
  let fld3 = req.params.type=='mfg' ? 'subpool' : 'sample'

  const savePoolStatus = () => {
    let sql = "UPDATE sample_basket SET " + fld1 + "_ok='YES' WHERE " + fld1 + "=:sample";
    return db.query(sql, {
      sample: req.params.sample
    });
  }

  const savePool = () => {
    let list = req.body.trim().split(/,/g)
    let sql = "UPDATE sample_basket SET " + fld1 + "=:sample, " + fld1 + "_ok='YES', "
      + fld2 + "=:staff WHERE " + fld3 + " IN ('" + list.join("','") + "')"
    console.log(sql, req.params.sample, req.params.staff || '')
    return db.query(sql, {
      sample: req.params.sample,
      staff: req.params.staff || ''
    })
  }
  savePool().then(savePoolStatus).catch((e) => {
    console.log('ERROR', e)
    $scope.error = true
  }).then(() => {
    if ($scope.error) {
      res.send({
        status:false
      })
      return
    }
    res.send({
      status:true
    })
  })
})

router.get('/checkExpire/:type/:sample/:product/:pool/:staff?', (req, res) => {
  console.log('checkExpire', req.params)
  const $scope = {
    error: false,
    oradb: null,
    list: [],
    notFound: false,
    numDays: 60
  }
  const db = mysql.connect()

  const getConfig = () => {
    let sql = "SELECT `value` FROM bp_config WHERE `name`='expireDays'"
    return db.query(sql).then((rows) => {
      if (rows.length > 0) {
        $scope.numDays = parseInt(rows[0].value)
        console.log('days=', $scope.numDays)
      }
    })
  }

  const getExpireMfg = () => {
    let sql = "SELECT sample, IF(exp_date<=:exp_date,1,0) is_exp, exp_date "
      + "FROM sample_basket "
      + "WHERE subpool=:sample "
    return db.query(sql, {
      sample: req.params.sample,
      exp_date: moment().add($scope.numDays, 'd').format('YYYY-MM-DD')
    }).then((rows) => {
      if (rows.length==0) {
        $scope.notFound = true
        return
      }
      $scope.list = rows.filter((row) => {
        return row.is_exp==1
      }).map((row) => {
        return row.sample + ',' + row.exp_date
      })
    })
  }

  const getExpireSample = () => {
    let sql = "SELECT sample, IF(exp_date<=:exp_date,1,0) is_exp, exp_date "
      + "FROM sample_basket "
      + "WHERE sample=:sample "
    console.log(sql, req.params.sample, moment().add($scope.numDays, 'd').format('YYYY-MM-DD'))
    return db.query(sql, {
      sample: req.params.sample,
      exp_date: moment().add($scope.numDays, 'd').format('YYYY-MM-DD')
    }).then((rows) => {
      if (rows.length==0) {
        $scope.notFound = true
        return
      }
      $scope.list = rows.filter((row) => {
        return row.is_exp==1
      }).map((row) => {
        return row.sample + ',' + row.exp_date
      })
    })
  }

  // const updatePool = () => {
  //   let fld1 = req.params.type=='mfg' ? 'mfgpool' : 'subpool';
  //   let fld2 = req.params.type=='mfg' ? 'subpool' : 'sample';
  //   let sql = "UPDATE sample_basket SET " + fld1 + "=:pool, " + fld1 + "_ok='NO' WHERE " + fld2 + "=:sample";
  //   console.log('SQL', sql, req.params.pool, req.params.sample);
  //   return db.query(sql, {
  //     pool: req.params.pool,
  //     sample: req.params.sample,
  //   })
  // }

  q.all([
    getConfig(),
    oracle.connect().then((oradb) => {
      $scope.oradb = oradb
    })
  ]).then(() => {
    if (req.params.type=='sub') {
      return getExpireSample()
    }
    return getExpireMfg()
  }).catch((e) => {
    $scope.error = true
    console.log('ERROR:', e)
  }).done(() => {
    oracle.close($scope.oradb)
    if ($scope.error) {
      res.send({status:false})
      return
    }
    res.send({
      status:true,
      notFound: $scope.notFound,
      list: $scope.list,
      days: $scope.numDays
    })
    if (!$scope.notFound) {
      //updatePool();
    }
  })
})

router.get('/checkExpireOracle/:type/:sample/:product/:staff?', (req, res) => {
  const $scope = {
    error: false,
    oradb: null,
    list: [],
    numDays: 60
  }
  const db = mysql.connect()

  const getOracle = () => {
    return oracle.connect()
  }

  const getConfig = function() {
    let sql = "SELECT `value` FROM bp_config WHERE `name`='expireDays'"
    return db.query(sql).then((rows) => {
      if (rows.length > 0) {
        $scope.numDays = parseInt(rows[0].value)
        console.log('days=', $scope.numDays)
      }
    })
  }
  const getExpireMfg = function() {
    let sql = "SELECT u.prel_no AS sample, u.stk_dtperemp AS exp_date "
      + "FROM stock s "
      + "	JOIN stockdec d on s.stk_id=d.stk_id_new "
      + "	JOIN stock u on d.stk_id=u.stk_id "
      + "WHERE s.prel_no=:sample AND s.prodf_cd=:product "
      + "  AND u.stk_dtperemp <= to_date(:today, 'YYYY-MM-DD')"
    console.log(moment().add($scope.numDays, 'd').format('YYYY-MM-DD'))
    return oracle.query($scope.oradb, sql, {
      sample: req.params.sample,
      product: req.params.product,
      today: moment().add($scope.numDays, 'd').format('YYYY-MM-DD')
    }).then((rows) => {
      $scope.list = rows.map((row) => {
        return row.SAMPLE + ',' + moment(row.EXP_DATE).format('YYYY-MM-DD')
      })
    })
  }
  const getExpireSample = function() {
    let sql = "SELECT s.prel_no AS sample, s.stk_dtperemp AS exp_date "
      + "FROM stock s "
      + "WHERE s.prel_no=:sample AND s.prodf_cd=:product "
      + "  AND s.stk_dtperemp <= to_date(:today, 'YYYY-MM-DD')"
    console.log(sql, moment().add($scope.numDays, 'd').format('YYYY-MM-DD'))
    return oracle.query($scope.oradb, sql, {
      sample: req.params.sample,
      product: req.params.product,
      today: moment().add($scope.numDays, 'd').format('YYYY-MM-DD')
    }).then((rows) => {
      $scope.list = rows.map((row) => {
        return row.SAMPLE + ',' + moment(row.EXP_DATE).format('YYYY-MM-DD')
      })
    })
  }

  q.all([
    getConfig(),
    oracle.connect().then((oradb) => {
      $scope.oradb = oradb
    })
  ]).then(() => {
    if (req.params.type=='sub') {
      return getExpireSample()
    }
    return getExpireMfg()
  }).catch((e) => {
    $scope.error = true
    console.log('ERROR:', e)
  }).done(() => {
    oracle.close($scope.oradb)
    if ($scope.error) {
      res.send({status:false})
      return
    }
    res.send({
      status:true,
      list: $scope.list,
      days: $scope.numDays
    })
  })
})

router.get('/checkExpireOLD/:sample/:staff?', (req, res) => {
  const $scope = {
    basket:'',
    list:[]
  }
  const db = mysql.connect()
  const getSamples = () => {
    let sql = "	select sample, basket from sample_basket where basket = ("
      + "		select basket		from sample_basket		where sample=:sample)"
    return db.query(sql, {sample: req.params.sample}).then((rows) => {
//      console.log('samples', rows)
      if (rows.length > 0) {
        $scope.basket = rows[0].basket
      }
      $scope.list = rows.map((row) => {
        return row.sample
      })
//      console.log('ok')
    })
  }
  const checkExpire = () => {
    let sql = "select sample, expire from test_expire where sample in ('"
      + $scope.list.join("','")
      + "') AND expire <= '" + moment().format('YYYY-MM-DD') + "'"
    return db.query(sql).then((rows) => {
//      console.log('expires', rows)
      $scope.list2 = rows.map((row) => {
        return row.sample + '=' + row.expire
      })
    })
  }
  const saveResult = () => {
    let sql = "INSERT INTO check_quarantine_result "
      + "(check_date, has_expire, sample, basket, samples, expires, staff )"
      + " VALUES(NOW(), :exp, :sample, :basket, :samples, :expires, :staff)"
    return db.query(sql, {
      exp: $scope.list2.length > 0 ? 'YES' : 'NO',
      sample: req.params.sample,
      basket: $scope.basket,
      samples: $scope.list.join(','),
      expires: $scope.list2.join(','),
      staff: req.params.staff || '',
    })
  }
  getSamples().then(checkExpire).then(saveResult).catch((e) => {
    console.log('ERROR', e)
  }).done(() => {
    res.send({
      status:true,
      expires: $scope.list2
    })
  })
})

module.exports = router
