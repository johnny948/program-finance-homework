const cors = require('cors');

const corsOptions = {
    origin: 'http://127.0.0.1:3001',
    credentials: true,
};

module.exports = cors(corsOptions);
