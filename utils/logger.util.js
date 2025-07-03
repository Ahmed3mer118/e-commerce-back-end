const { createLogger, format, transports } = require("winston")
const  stack = require("../router/productRouter")
const logger = createLogger({
    level: process.env.NODE_EVN === "production" ? "info" : "debug",
    format: format.combine(
        format.timestamp({ format: 'YYYY/MM/DD HH:MM:SS' }),
        format.errors({ stack: true }),
        format.printf(({ timestamp, level, message, stack }) => {
            return `Timestamp : ${timestamp};
            Level : ${level.toUpperCase()} ; Message : ${message} ;\n Stack : ${stack ? ` ${stack}` : " "} `
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "logs/error.log", level: 'error' }),
        new transports.File({ filename: "logs/combined.log" })
    ]
})

module.exports = logger
