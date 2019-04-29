const express = require('express');
const { catchErrors } = require('../handlers/errorHandlers');
const apiController = require('../controllers/apiController');
const router = express.Router();

router.get('/', apiController.getStatsforGraph);

module.exports = router;
