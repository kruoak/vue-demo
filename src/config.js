module.exports = {
  server: {
    port: 9000
  },
  session: {
    secret: 'secret'
  },
  webpack: {
    port: 3000,
  },
  db_default: process.env.ENV ? 'my_'+process.env.ENV : 'my',
  db: {
    my: {
      host: 'localhost',
      port: 3306,
      schema: 'demo',
      user: 'demo',
      pass: '1234',
      debug: false,
      connLimit: 100,
      charset: 'utf8mb4_unicode_ci'
    },
    my_docker: {
      host: 'mysql',
      port: 3306,
      schema: 'demo',
      user: 'demo',
      pass: '1234',
      debug: false,
      connLimit: 100,
      charset: 'utf8mb4_unicode_ci'
    }
  },
  oracledb: {
    param: {
      user          : "user",
      password      : "pass",
      connectString : "//localhost/TEST"
    }
  }
}
