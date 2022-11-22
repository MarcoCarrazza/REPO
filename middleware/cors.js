const cors = require('cors');

const corsOptions = {
  // origin: 'http://127.0.0.1:3000/',
  origin: 'http://localhost:3000/',
  optionsSuccessStatus: 200
}

module.exports = cors(corsOptions)