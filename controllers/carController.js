const Car = require('../models/Car');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const userId = req.user._id;
      const uploadPath = path.join(__dirname, 'uploads', userId.toString());
      await fs.ensureDir(uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with a timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  }
});


const upload = multer({ storage });

const createCar = async (req, res) => {
  const { title, description, tags } = req.body;
  const images = req.files.map(file => {
    return path.relative(__dirname, file.path);
  });

  const newCar = new Car({
    title,
    description,
    tags,
    images,
    user: req.user._id
  });

  try {
    // Save the new car to the database
    await newCar.save();
    res.status(201).json(newCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getCars = async (req, res) => {
  try {
    const cars = await Car.find({ user: req.user._id });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCar = async (req, res) => {
  const { title, description, tags } = req.body;
  const images = req.files ? req.files.map(file => file.path) : [];

  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    if (car.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    car.title = title || car.title;
    car.description = description || car.description;
    car.tags = tags || car.tags;
    car.images = [...car.images, ...images];

    await car.save();
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    if (car.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    await Car.deleteOne({ _id: req.params.id });
    res.json({ message: 'Car removed' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchCars = async (req, res) => {
  const keyword = req.query.keyword || '';
  try {
    const cars = await Car.find({
      user: req.user._id,
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [keyword] } }
      ]
    });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createCar, getCars, getCarById, updateCar, deleteCar, searchCars, upload };
