import { main } from './app.js';

import log4js from 'log4js';

if (process.env.NODE_ENV !== 'test') {
    log4js.configure({
        appenders: {
            file: { type: 'fileSync', filename: 'logs/debug.log' },
            console: { type: 'console' }
        },
        categories: {
            default: { appenders: ['file', 'console'], level: 'debug'}
        }
    });
    main();
}

