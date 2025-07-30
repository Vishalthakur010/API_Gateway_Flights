const express = require('express')
const rateLimit = require('express-rate-limit')
const { createProxyMiddleware } = require('http-proxy-middleware');

const {Logger, serverConfig}=require('./config')
const apiRoutes=require('./routes')

const app = express()

const limiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 3, // limit each IP to 3 requests per `window` (2 min)
    message: '⚠️ Too many requests from this IP, please try again later.'
});

app.use(express.json());             // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(limiter)

// Proxy /api requests to a backend server
app.use('/flightsService', createProxyMiddleware({
    target: serverConfig.FLIGHT_SERVICE, // target server
    changeOrigin: true,              // needed for virtual hosted sites
    pathRewrite: {
        '^/flightsService': '', // remove /api from the proxied request
    },
}));

app.use('/bookingService', createProxyMiddleware({
    target: serverConfig.BOOKING_SERVICE, // target server
    changeOrigin: true,              // needed for virtual hosted sites
    pathRewrite: {
        '^/bookingService': '', // remove /api from the proxied request
    },
}));

app.use('/api', apiRoutes)

app.listen(serverConfig.PORT,()=>{
    console.log(`Successfully started the server at port : ${serverConfig.PORT}`)
    // Logger.info("Successfully started the server", {})
})