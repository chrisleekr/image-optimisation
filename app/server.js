require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const bunyanMiddleware = require('bunyan-middleware');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const { logger } = require('./helpers/logger');

const app = express();

const port = process.env.PORT || 3000;
app.set('trust proxy', true);
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(
  bunyanMiddleware({
    headerName: 'X-Request-Id',
    propertyName: 'reqId',
    logName: 'reqId',
    obscureHeaders: ['authorization'],
    logger,
    additionalRequestFinishData: (_req, _res) => {
      return {};
    }
  })
);

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOWS_MS || 60 * 1000, // 1 minute
  max: process.env.RATE_LIMIT_MAX || 10 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  fileUpload({
    useTempFiles: true,
    safeFileNames: false,
    tempFileDir: '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 },
    debug: false
  })
);

require('./routes/index')(app);

// catch 404 and forward to error handler
app.get('*', (_req, res) => {
  res.status(404).send({ success: false, status: 404, message: 'Page not found.', data: {} });
});

const server = app.listen(port);

logger.info(`API server started on: ${port}`);

module.exports = { app, server };
