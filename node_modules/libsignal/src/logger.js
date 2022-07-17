const loggerPino = require('pino');

const _logger = loggerPino({ enabled : false });

function getLogger(){
    return _logger;
}


module.exports = { getLogger }

