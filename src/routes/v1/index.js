const express = require('express')
const router = express.Router()

const {InfoControlelr} = require('../../controllers')
const {AuthRequestMiddlewares} = require('../../middlewares')

const userRoutes = require('./user-routes')

router.get('/info', AuthRequestMiddlewares.checkAuth, InfoControlelr.info)
router.use('/user', userRoutes)

module.exports= router