const express = require('express');
const { catchErrors } = require('../handlers/errorHandlers');
const viewController = require('../controllers/viewController');
const router = express.Router();

// 1. get data from database
// 1.1 get info



// 2. render views
router.get('/', viewController.getStatsforGraph);

module.exports = router;




