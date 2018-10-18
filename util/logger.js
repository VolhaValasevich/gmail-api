const { createLogger, format, transports, addColors } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const myCustomLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'white' 
    }
};

addColors(myCustomLevels.colors);

class Logger {
    constructor() {
        this.logger = createLogger({
            levels: myCustomLevels.levels,
            transports: [
                new transports.Console({
                    format: combine(
                        label({ label: 'mail.google.com' }),
                        timestamp({
                            format: 'YYYY-MM-DD HH:mm:ss'
                        }),
                        format.colorize({
                            all: true
                        }),
                        myFormat
                    ),
                    level: 'debug'
                }),
                new transports.File({ filename: 'combined.log', format: format.simple(), level: 'debug' })
            ]
        });
    }
}

module.exports = new Logger();