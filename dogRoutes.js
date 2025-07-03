const express = require('express');
const router = express.Router();
const dogController = require('../controllers/dogController');
const auth = require('../middlewares/auth');

router.post('/', auth, dogController.registerDog);
router.post('/:id/adopt', auth, dogController.adoptDog);
router.delete('/:id', auth, dogController.removeDog);
router.get('/registered', auth, dogController.listRegisteredDogs);
router.get('/adopted', auth, dogController.listAdoptedDogs);

module.exports = router;
