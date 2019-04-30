const express = require('express');
const { catchErrors } = require('../handlers/errorHandlers');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const databaseController = require('../controllers/databaseController');
const router = express.Router();


// 1. authentication
router.get('/login', viewController.loginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
// 2. get data from database

router.get('/:scope/live', catchErrors(databaseController.getLiveStats));
router.get('/:scope/stats', catchErrors(databaseController.getStats));


// 2. render views
router.get('/', authController.isLoggedIn, viewController.history);


module.exports = router;




