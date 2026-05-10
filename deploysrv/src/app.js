const express = require('express')
const app = express()

app.use(express.json())

const participantRoutes = require('./routes/participants')
app.use ('/participants', participantRoutes)

module.exports = app;