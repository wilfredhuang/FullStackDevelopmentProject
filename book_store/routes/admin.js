const AdminBro = require('admin-bro')
const AdminBroExpress = require('admin-bro-expressjs')
const AdminBroSequelize = require('admin-bro-sequelizejs')

AdminBro.registerAdapter(AdminBroSequelize)

const express = require('express')
const app = express()
const db = require('../models/User')

const adminBro = new AdminBro({
  databases: [db],
  rootPath: '/admin',
})

const router = AdminBroExpress.buildRouter(adminBro)

module.exports = router;
