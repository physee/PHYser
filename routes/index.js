const express = require('express');
const { catchErrors } = require('../handlers/errorHandlers');
const viewController = require('../controllers/viewController');
const databaseController = require('../controllers/databaseController');
const router = express.Router();

// 1. get data from database
router.get('/:scope/:id/live', catchErrors(databaseController.getLiveStatsById));
router.get('/:scope/:id/stats', catchErrors(databaseController.getStatsById));


// 2. render views
router.get('/', catchErrors(viewController.dashboard));
router.get('/history', catchErrors(viewController.history));



module.exports = router;




