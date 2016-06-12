'use strict'

process.env.NLS_LANG = 'THAI_THAILAND.UTF8';

const oracledb = require('oracledb');
const q = require('q');
var oraPool = null

//oracledb.connectionClass = 'SS';
//oracledb.fetchAsString = [ oracledb.DATE ];

module.exports = function(config) {
  oracledb.maxRows = config.oracledb.maxRows || 100

  if (!config) {
    config = require('../config')
  }
  return {
    connect() {
      var dfd = q.defer();
      if (oraPool != null) {
        oraPool.getConnection(function(error, conn) {
          if (error) {
            console.error(error.message);
            dfd.reject(error.message);
            return;
          }
          console.log('Pool=', oraPool.connectionsOpen, '/', oraPool.poolMax);
          dfd.resolve(conn);
        });
      } else {
        oracledb.createPool(config.oracledb.param, function(error, pool){
          if (error) {
            console.error(error.message);
            dfd.reject(error.message);
            return;
          }
          oraPool = pool
          oraPool.getConnection(function(error, conn) {
            if (error) {
              console.error(error.message);
              dfd.reject(error.message);
              return;
            }
            console.log('Pool=', oraPool.connectionsOpen, '/', oraPool.poolMax);
            dfd.resolve(conn);
          });
        });
      }
      return dfd.promise;
    },

    query(conn, sql, param, commit, format) {
      var dfd = q.defer();
      var outFormat = format || oracledb.OBJECT
      conn.execute(sql, param, { outFormat }, function(error, result) {
        if (error) {
          console.log('ERROR0:', error.message);
          dfd.reject(error.message);
          return;
        }
        if (commit) {
          conn.commit(function(error, result) {
            if (error) {
              console.log('ERROR1:', error.message);
              dfd.reject(error.message);
              return;
            }
            if (outFormat==oracledb.OBJECT) {
              dfd.resolve(result.rows)
            } else {
              dfd.resolve(result)
            }
          })
        } else {
          if (outFormat==oracledb.OBJECT) {
            dfd.resolve(result.rows)
          } else {
            dfd.resolve(result)
          }
        }
      });

      return dfd.promise;
    },

    queryArray(conn, sql, param, commit) {
      return this.query(conn, sql, param, commit, oracledb.ARRAY)
    },

    queryAll(conn, sql, param, format) {
      var dfd = q.defer();
      var outFormat = format || oracledb.OBJECT;
      const fetchSize = 1000;
      const out = [];

      const fetchRowsFromRS = (rs) => {
        rs.getRows(fetchSize, (err, rows) => {
          let done = false;
          if (err) {
            console.log('ERROR00:', err.message);
            dfd.reject(err.message);
            return;
          } else if (rows.length > 0) {
            out.push(...rows);
            if (rows.length == fetchSize) {
              fetchRowsFromRS(rs);
            } else {
              done = true;
            }
          } else {
            done = true;
          }
          if (done) {
            rs.close();
            dfd.resolve(out);
          }
        })
      }

      conn.execute(sql, param, { resultSet: true, outFormat }, function(error, result) {
        if (error) {
          console.log('ERROR0:', error.message);
          dfd.reject(error.message);
          return;
        }
        fetchRowsFromRS(result.resultSet);
      });

      return dfd.promise;
    },

    close(conn) {
      var dfd = q.defer();
      conn.release(function(err) {
        if (err) {
          dfd.reject(err.message);
          return;
        }
        dfd.resolve();
      });
      return dfd.promise;
    },

    convert(result) {
      var fields = result.metaData.map(function(item) {
        return item.name.toLowerCase();
      });
      return result.rows.map(function(row) {
        var out = {};
        row.forEach(function(data, i) {
          out[fields[i]] = data;
        });
        return out;
      });
    }
  }
}
