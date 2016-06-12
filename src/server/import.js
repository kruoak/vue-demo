'use strict'

const q = require('q')
const moment = require('moment')
const oracledb = require('oracledb')
const config = require('../config')
const mysql = require('../lib/mysql')(config)
const oracle = require('../lib/oracle')(config)
const helper = require('../lib/helper')


const testBug = () => {
  let $scope = {
    oradb: null
  }
  oracle.connect().then((oradb) => {
    $scope.oradb = oradb
    return oracle.query(oradb, "select * from t1", []).then((rows) => {
      console.log(rows);
    })
  }).done(() => {
    oracle.close($scope.oradb)
    console.log('ok')
  })
}
//testBug()

const importBagType = function() {
  let $scope = {
    oradb: null,
  }
  let db = mysql.connect()
  oracle.connect().then((oradb) => {
    $scope.oradb = oradb
    let sql = "SELECT * FROM ptyppoche ORDER BY ptypp_cd"
    return oracle.query(oradb, sql, {})
  }).then((rows) => {
    let sql = "INSERT INTO bag_type (code, name, short_name, type, volume, "
      + "supp_code) VALUES "
      + rows.map((row) => {
        return "('" + row.PTYPP_CD + "','"
          + row.PTYPP_LIB.trim() + "','"
          + (row.PTYPP_COAG || '').trim() + "','"
          + (row.PTYPP_TB_PCH=='P' ? 'BAG' : 'BOTTLE') + "',"
          + (row.VOL_COAG || 0) + ",'"
          + (row.PTYPP_FOURN||'').trim() + "')"
      }).join(',')
      + " ON DUPLICATE KEY UPDATE name=VALUES(name), short_name=VALUES(short_name), "
      + " type=VALUES(type), volume=VALUES(volume) "
    return db.query(sql)
  }).done(() => {
    if ($scope.oradb) {
      oracle.close($scope.oradb)
    }
    console.log('IMPORT bag_type DONE')
  })
}


const importDonationCategory = function() {
  let $scope = {
    oradb: null,
  }
  let db = mysql.connect()
  oracle.connect().then((oradb) => {
    $scope.oradb = oradb
    let sql = "SELECT * FROM pcatdon ORDER BY pcatd_cd"
    return oracle.query(oradb, sql, {})
  }).then((rows) => {
    let sql = "INSERT INTO donatioin_category (code, name) VALUES "
      + rows.map((row) => {
        return "('" + row.PCATD_CD.trim() + "', '" + row.PCATD_LIB.trim() + "')"
      }).join(',')
      + " ON DUPLICATE KEY UPDATE name=VALUES(name)"
    return db.query(sql)
  }).done(() => {
    if ($scope.oradb) {
      oracle.close($scope.oradb)
    }
    console.log('IMPORT donation_category DONE')
  })
}

const importDonationUsage = function() {
  let $scope = {
    oradb: null,
  }
  let db = mysql.connect()
  oracle.connect().then((oradb) => {
    $scope.oradb = oradb
    let sql = "SELECT * FROM putildon ORDER BY putd_cd"
    return oracle.query(oradb, sql, {})
  }).then((rows) => {
    let sql = "INSERT INTO donation_usage (code, name) VALUES "
      + rows.map((row) => {
        return "('" + row.PUTD_CD + "','"
          + row.PUTD_LIB.trim() + "')"
      }).join(',')
      + " ON DUPLICATE KEY UPDATE name=VALUES(name)"
    return db.query(sql)
  }).done(() => {
    if ($scope.oradb) {
      oracle.close($scope.oradb)
    }
    console.log('IMPORT donation_usage DONE')
  })
}
const importDonationUnit = function() {
  let $scope = {
    oradb: null,
  }
  let db = mysql.connect()
  oracle.connect().then((oradb) => {
    $scope.oradb = oradb
    let sql = "SELECT * FROM collectivite ORDER BY coll_cd "
    return oracle.query(oradb, sql, {})
  }).then((rows) => {
    let sql = "INSERT INTO donation_unit (code, name, location, addr1, addr2, "
      + "province, tmp_country_code, zipcode, tel1, tel2, fax, email, website, "
      + "map_lat, map_lng, assoc_code, unit_type_code, unit_cat_code, unit_mode_code, "
      + "site_code, info, is_secure, last_donate, last_donor, is_active) VALUES "
      + rows.map((row) => {
        return "('" + row.COLL_CD + "','"
          + (row.COLL_LIBELLE||'').trim() + "','"
          + mysql.pq((row.COLL_NOMLIEU||'').trim()) + "','"
          + (row.COLL_ADR1||'').trim() + "','"
          + (row.COLL_ADR2||'').trim() + "','"
          + (row.COLL_VILLE||'').trim() + "','"
          + (row.PPAYS_CD||'').trim() + "','"
          + (row.COLL_CPOST||'').trim() + "','"
          + (row.COLL_TELCOL||'').trim() + "','"
          + (row.COLL_TELLIEU||'').trim() + "','"
          + (row.COLL_FAX||'').trim() + "','"
          + (row.COLL_EMAIL||'').trim() + "','"
          + (row.COLL_WEB||'').trim() + "',0,0,'"
          + (row.ASSOC_CD||'').trim() + "','"
          + (row.COLL_TYPE||'').trim() + "','"
          + (row.COLL_CATEGORIE||'').trim() + "','"
          + (row.COLL_MODE||'').trim() + "','"
          + (row.COLL_SITE||'').trim() + "','','"
          + (row.COLL_TSSITES=='T' ?'YES':'NO') + "',NULL,"
          + (!row.COLL_PREVDON ? 0 : row.COLL_PREVDON) + ",'"
          + (row.COLL_ACTIVE=='F' ? 'NO' : 'YES') + "')"
      }).join(',')
      + " ON DUPLICATE KEY UPDATE name=VALUES(name), location=VALUES(location), "
      + "addr1=VALUES(addr1), addr2=VALUES(addr2), province=VALUES(province), "
      + "tmp_country_code=VALUES(tmp_country_code), zipcode=VALUES(zipcode), "
      + "tel1=VALUES(tel1), tel2=VALUES(tel2), fax=VALUES(fax), email=VALUES(email), "
      + "website=VALUES(website), assoc_code=VALUES(assoc_code), "
      + "unit_type_code=VALUES(unit_type_code), unit_cat_code=VALUES(unit_cat_code), "
      + "unit_mode_code=VALUES(unit_mode_code), site_code=VALUES(site_code), "
      + "is_secure=VALUES(is_secure), last_donor=VALUES(last_donor), "
      + "is_active=VALUES(is_active)"
    return db.query(sql)
  }).done(() => {
    if ($scope.oradb) {
      oracle.close($scope.oradb)
    }
    console.log('IMPORT donation_unit DONE')
  })
}


const importIdType = function() {
  let $scope = {
    oradb: null,
  }
  let db = mysql.connect()
  oracle.connect().then((oradb) => {
    $scope.oradb = oradb
    let sql = "SELECT * FROM ptypident ORDER BY ptypid_cd"
    return oracle.query(oradb, sql, {})
  }).then((rows) => {
    let sql = "INSERT INTO id_type (code, name, min_length, max_length, "
      + "input_mask, local_unique, global_unique) VALUES "
      + rows.map((row) => {
        return "('" + row.PTYPID_CD + "','"
          + (row.PTYPID_LIB||'').trim() + "',"
          + (row.PTYPID_LMIN||10)+","
          + (row.PTYPID_LMAX||10)+",'','"
          + (row.PTYPID_UNIC_IND=='F' ? 'NO' : 'YES') + "','"
          + (row.PTYPID_UNIC_H2G=='F' ? 'NO' : 'YES') + "')"
      }).join(',')
      + " ON DUPLICATE KEY UPDATE name=VALUES(name), min_length=VALUES(min_length), "
      + "max_length=VALUES(max_length), local_unique=VALUES(local_unique), "
      + "global_unique=VALUES(global_unique)"
    return db.query(sql)
  }).done(() => {
    if ($scope.oradb) {
      oracle.close($scope.oradb)
    }
    console.log('IMPORT id_type DONE')
  })
}

const importDonor2 = function() {
  let $scope = {
    oradb: null,
    totalRows: 0
  }
  let db = mysql.connect()

  oracle.connect().then((oradb) => {
    $scope.oradb = oradb
    const getDonorCount = () => {
      return oracle.query(oradb, "SELECT COUNT(*) CNT FROM donneur", {}).then((rows) => {
        if (rows.length == 0) {
          throw 'NO DONOR'
        }
        $scope.totalRows = rows[0].CNT
        console.log('DONOR COUNT=', $scope.totalRows)
      })
    }
    const getDonor = (from, to) => {
      console.log('DONOR', from, to)
      let sql = "select * from (  select rownum r, d.* from donneur d where rownum <= "+to+") x where r >= "+from
      return oracle.query(oradb, sql, {})
    }
    const insertDonor = (rows) => {
      let sql = "INSERT INTO donor (code, firstname, lastname, dob, prename_code, "
        + "gender, addr, town_code, city_code, state_code, country_code, "
        + "zipcode, nation_code, tel, mobile, person_code, assoc_code, "
        + "last_donate, blood_type, nation_id_info) VALUES "
        + rows.map((row) => {
          return "('" + row.DONN_NUMERO.trim() + "','"
            + mysql.pq((row.DONN_PRENOM||'').trim()) + "','"
            + mysql.pq((row.DONN_NOM||'').trim()) + "',"
            + (row.DONN_DNAISS ? "'"+moment(row.DONN_DNAISS).format('YYYY-MM-DD')+"'" : 'NULL') + ",'"
            + (row.PTITRE_CD||'').trim() + "','"
            + (row.DONN_SX||'M').trim() + "','"
            + mysql.pq((row.DONN_ADRESSE||'').trim()) + "','','','','"
            + (row.PPAYS_CD=='THAI'?'THA':'') + "','"
            + (row.DONN_CPOST) + "','"
            + (row.PPAYS_NAT_CD=='THAI'?'THA':'').trim() + "','','"
            + (row.DONN_TELP_NO||'').trim() + "','"
            + (row.PPROF_CD==null||row.PPROF_CD=='-' ? '0' : row.PPROF_CD).trim() + "','"
            + (row.ASSOC_CD||'').trim() + "',NULL,'"
            + (row.DONN_GRPRH||'').trim() + "','{}')"
        }).join(',') + " ON DUPLICATE KEY UPDATE firstname=VALUES(firstname), "
          + "lastname=VALUES(lastname), dob=VALUES(dob), prename_code=VALUES(prename_code), "
          + "gender=VALUES(gender), addr=VALUES(addr), zipcode=VALUES(zipcode), "
          + "mobile=VALUES(mobile), person_code=VALUES(person_code), "
          + "assoc_code=VALUES(assoc_code), blood_type=VALUES(blood_type)"
      return db.query(sql)
    }

    return getDonorCount().then(() => {
      let i = 45301
      let batchSize =100
      return helper.promiseWhile(() => {
        return i < $scope.totalRows
      }, () => {
        return getDonor(i+1, i+batchSize).then(insertDonor).then(() => {
          i += batchSize
        })
      })
    })
  }).catch((e) => {
    console.log('ERROR=',e)
  }).done(() => {
    if ($scope.oradb) {
      oracle.close($scope.oradb)
    }
    console.log('IMPORT donor DONE')
  })
}


const importDonor = function() {
  let $scope = {
    oradb: null,
    totalRows: 0
  }
  let db = mysql.connect()

  const getOraConnect = () => {
    return oracle.connect().then((oradb) => {
      $scope.oradb = oradb
    })
  }

  const getDonorCount = () => {
    return oracle.query($scope.oradb, "SELECT COUNT(*) CNT FROM donneur", {}).then((rows) => {
      if (rows.length == 0) {
        throw 'NO DONOR'
      }
      $scope.totalRows = rows[0].CNT
      console.log('DONOR COUNT=', $scope.totalRows)
    })
  }

  const insertDonor = (rows) => {
    let sql = "INSERT INTO donor (code, firstname, lastname, dob, prename_code, "
      + "gender, addr, town_code, city_code, state_code, country_code, "
      + "zipcode, nation_code, tel, mobile, person_code, assoc_code, "
      + "last_donate, blood_type, nation_id_info) VALUES "
      + rows.map((row) => {
        return "('" + row.DONN_NUMERO + "','"
          + mysql.pq((row.DONN_PRENOM||'').trim()) + "','"
          + mysql.pq((row.DONN_NOM||'').trim()) + "',"
          + (row.DONN_DNAISS ? "'"+moment(row.DONN_DNAISS).format('YYYY-MM-DD')+"'" : 'NULL') + ",'"
          + (row.PTITRE_CD||'').trim() + "','"
          + (row.DONN_SX||'M').trim() + "','"
          + mysql.pq((row.DONN_ADRESSE||'').trim()) + "','','','','"
          + (row.PPAYS_CD=='THAI'?'THA':'') + "','"
          + (row.DONN_CPOST||'') + "','"
          + (row.PPAYS_NAT_CD=='THAI'?'THA':'').trim() + "','','"
          + mysql.pq((row.DONN_TELP_NO||'').trim()) + "','"
          + (row.PPROF_CD==null||row.PPROF_CD=='-' ? '0' : row.PPROF_CD).trim() + "','"
          + (row.ASSOC_CD||'').trim() + "',NULL,'"
          + (row.DONN_GRPRH||'').trim() + "','{}')"
      }).join(',') + " ON DUPLICATE KEY UPDATE firstname=VALUES(firstname), "
        + "lastname=VALUES(lastname), dob=VALUES(dob), prename_code=VALUES(prename_code), "
        + "gender=VALUES(gender), addr=VALUES(addr), zipcode=VALUES(zipcode), "
        + "mobile=VALUES(mobile), person_code=VALUES(person_code), "
        + "assoc_code=VALUES(assoc_code), blood_type=VALUES(blood_type)"
    return db.query(sql)
  }

  const fetchRows = () => {

  }
  $scope.startTime = moment()
  return getOraConnect().then(() => {
    let cnt = 0
    let batchSize = 5000
    let dfd = q.defer()
    let sql = 'SELECT DONN_NUMERO,cast(DONN_PRENOM as nvarchar2(200)) DONN_PRENOM,'
      + 'cast(DONN_NOM as nvarchar2(200)) DONN_NOM,DONN_DNAISS,PTITRE_CD,'
      + 'DONN_SX,cast(DONN_ADRESSE as nvarchar2(600)) DONN_ADRESSE,PPAYS_CD,'
      + 'DONN_CPOST,PPAYS_NAT_CD,DONN_TELP_NO,PPROF_CD,ASSOC_CD,DONN_GRPRH FROM donneur'
    $scope.oradb.execute(sql, [], {
        outFormat: oracledb.OBJECT,
        resultSet:true
      }, (err, result) => {
      if (err) {
        throw err
      }
      let rs = result.resultSet
      let done = false
      return helper.promiseWhile(() => {
        return !done
      }, () => {
        let dfd2 = q.defer()
        rs.getRows(batchSize, (err, rows) => {
          if (err) {
            throw err
          }
          if (rows.length==0) {
            done = true
            rs.close(() => {
              dfd2.resolve()
            })
          } else {
            cnt += rows.length
            console.log('cnt=', cnt, 'rows=', rows.length)
            insertDonor(rows).then(() => {
              dfd2.resolve()
            }).catch((e) => {
              console.log(e)
            })
          }
        })
        return dfd2.promise
      }).then(() => {
        dfd.resolve()
      })
    })
    return dfd.promise
  }).catch((e) => {
    console.log('ERROR=',e)
  }).done(() => {
    if ($scope.oradb) {
      oracle.close($scope.oradb)
    }
    console.log('IMPORT donor DONE')
    console.log(moment().diff($scope.startTime, 'seconds'))
  })
}


const importDonorId = function() {
  let $scope = {
    oradb: null,
    totalRows: 0
  }
  let db = mysql.connect()

  const getOraConnect = () => {
    return oracle.connect().then((oradb) => {
      $scope.oradb = oradb
    })
  }

  const insertDonorId = (rows) => {
    let sql = "INSERT INTO donor_id (code, site, id_type, id_code) VALUES "
      + rows.map((row) => {
        return "('" + row.DONN_NUMERO + "','"
          + (row.IDENT_SITE.trim()=='.' ? '' : row.IDENT_SITE.trim()) + "','"
          + row.IDENT_TYPE.trim() + "','"
          + (row.IDENT_CD==null ? '' : row.IDENT_CD) + "')"
      }).join(',') + " ON DUPLICATE KEY UPDATE id_code=VALUES(id_code)"
    return db.query(sql)
  }

  const fetchRows = () => {

  }
  $scope.startTime = moment()
  return getOraConnect().then(() => {
    let cnt = 0
    let batchSize = 5000
    let dfd = q.defer()
    let sql = 'SELECT * FROM donnident'
    $scope.oradb.execute(sql, [], {
        outFormat: oracledb.OBJECT,
        resultSet:true
      }, (err, result) => {
      if (err) {
        throw err
      }
      let rs = result.resultSet
      let done = false
      return helper.promiseWhile(() => {
        return !done
      }, () => {
        let dfd2 = q.defer()
        rs.getRows(batchSize, (err, rows) => {
          if (err) {
            throw err
          }
          if (rows.length==0) {
            done = true
            rs.close(() => {
              dfd2.resolve()
            })
          } else {
            cnt += rows.length
            console.log('cnt=', cnt, 'rows=', rows.length)
            insertDonorId(rows).then(() => {
              dfd2.resolve()
            }).catch((e) => {
              console.log(e)
            })
          }
        })
        return dfd2.promise
      }).then(() => {
        dfd.resolve()
      })
    })
    return dfd.promise
  }).catch((e) => {
    console.log('ERROR=',e)
  }).done(() => {
    if ($scope.oradb) {
      oracle.close($scope.oradb)
    }
    console.log('IMPORT donor_id DONE')
    console.log(moment().diff($scope.startTime, 'seconds'))
  })
}


// importDonationCategory()
//importBagType()
//importDonateUsage()
//importDonationUnit()
//importIdType()
//importDonor()
importDonorId()
