const Dog = require('../models/Dog');

// Register a new dog
exports.registerDog = async (req, res) => {
  try {
    const { name, description } = req.body;
    const dog = new Dog({
      name,
      description,
      registeredBy: req.user._id
    });
    await dog.save();
    res.status(201).json(dog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to register dog' });
  }
};

// Adopt a dog
exports.adoptDog = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);

    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    if (dog.status === 'adopted') {
      return res.status(400).json({ error: 'Dog already adopted' });
    }
    if (dog.registeredBy.toString() === req.user._id.toString()) {
      return res.status(403).json({ error: 'Cannot adopt your own dog' });
    }

    const { thankYouMessage } = req.body;

    dog.status = 'adopted';
    dog.adoptedBy = req.user._id;
    dog.thankYouMessage = thankYouMessage;

    await dog.save();
    res.json(dog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to adopt dog' });
  }
};

// Remove dog (only if owner and not adopted)
exports.removeDog = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);

    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    if (dog.registeredBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not your dog' });
    }
    if (dog.status === 'adopted') {
      return res.status(400).json({ error: 'Cannot delete an adopted dog' });
    }

    await dog.remove();
    res.json({ message: 'Dog removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove dog' });
  }
};

// List registered dogs (filter by status and paginate)
exports.listRegisteredDogs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { registeredBy: req.user._id };
    if (status) query.status = status;

    const dogs = await Dog.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(dogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch registered dogs' });
  }
};

// List adopted dogs (paginate only)
exports.listAdoptedDogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const dogs = await Dog.find({ adoptedBy: req.user._id })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(dogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch adopted dogs' });
  }
};
