const router = require('express').Router();
const user = require('./users');
const clothingItem = require('./clothingItems');

router.use('/items', clothingItem);
router.use('/users', user);
router.use((req, res) => {
  res.status(404).send({ message: 'Router not found' });
});

module.exports = router;
