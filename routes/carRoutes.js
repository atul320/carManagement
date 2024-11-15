const express = require('express');
const { createCar, getCars, getCarById, updateCar, deleteCar, searchCars, upload } = require('../controllers/carController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, upload.array('images', 10), createCar);
router.get('/', protect, getCars);
router.get('/:id', protect, getCarById);
router.put('/:id', protect, upload.array('images', 10), updateCar);
router.delete('/:id', protect, deleteCar);
router.get('/search', protect, searchCars);

module.exports = router;
