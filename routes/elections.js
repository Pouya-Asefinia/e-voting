const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const { auth, adminOnly } = require('../middleware/auth');

// All the ways need to authorisetion 
router.use(auth);

// election CRUD
// create (just Admin)
router.post('/', adminOnly, electionController.create);
//  list of All
router.get('/', electionController.getAll);
// details of one
router.get('/:id', electionController.getOne);
// update (just Admin)
router.put('/:id', adminOnly, electionController.update);
// delete (just Admin)
router.delete('/:id', adminOnly, electionController.delete);

module.exports = router;
