const { format } = require('date-fns')
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async (msg, logFileName) => {
    const dateAndTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss')
    const logevent = `${dateAndTime}\t${uuidv4()}\t${msg}\n`

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logevent)
    } catch (err) {
        console.log(err)
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    console.log(`${req.method} ${req.path}`)
    next()
}

module.exports = { logEvents, logger }