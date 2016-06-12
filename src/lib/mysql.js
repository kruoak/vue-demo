'use strict'

const q = require('q');
const mysql = require('mysql');
const mysqlWrap = require('mysql-wrap');

const pool = {};

const getPool = function(config, dbname) {
  if (!pool[dbname]) {
    pool[dbname] = mysql.createPool({
      connectionLimit: config.db[dbname].connLimit || 100,
      host: config.db[dbname].host || 'localhost',
      port: config.db[dbname].port || 3306,
      database: config.db[dbname].schema || 'mysql',
      user: config.db[dbname].user || 'root',
      password: config.db[dbname].pass || '',
      debug: config.db[dbname].debug || false,
      supportBigNumbers: true,
      timezone:'+7:00',
      dateStrings:true,
      charset:config.db[dbname].charset || 'utf8mb4_unicode_ci',
      queryFormat: function (query, values) {
        if (!values) {
          return query;
        }
        query = query.replace(/\:(\w+)/g, function (txt, key) {
          if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
          }
          return txt;
        }.bind(this))

        return query;
      }
    });
  }
  return pool[dbname];
}

module.exports = function(config) {
  if (!config) {
    config = require('../config')
  }
  return {
    connect: function(dbname) {
      dbname = dbname || config.db_default || 'mysql';
      return mysqlWrap(getPool(config, dbname));
    },
    getPool: function(dbname) {
      dbname = dbname || config.db_default || 'mysql';
      return getPool(config, dbname);
    },
    pq: function(s) {
      return s.replace(/\\/mig, '\\\\').replace(/'/mig, "\\'");
    },
    toArray: function(rows, fields) {
      if (rows.length==0) {
        return {f:fields,d:[]}
      }
      return {f:fields,d:rows.map(function(row) {
        let tmp = [];
        for (i in row) {
          tmp.push(row[i]);
        }
        return tmp;
      })}
    }
  }
}
