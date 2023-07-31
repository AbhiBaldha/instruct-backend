import config from 'config'
const dotenv = require('dotenv');
import mongoose from 'mongoose'
import express from 'express'
import autoIncrement from 'mongoose-auto-increment'
const mongooseConnection = express()
dotenv.config({
    path: './.env',
  });
let dbUrl:any 
if (process.env.NODE_ENV) dbUrl = config.get('local_db_url')
if (!process.env.NODE_ENV) dbUrl = config.get('db_url')
// else dbUrl = config.get('clear')

let connection = mongoose.createConnection(dbUrl,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
mongoose.connect(
    dbUrl,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    }
).then(result => console.log('Database successfully connected')).catch(err => console.log(err))
autoIncrement.initialize(connection)

export { mongooseConnection, autoIncrement }
