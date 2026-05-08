const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { auth, adminOnly } = require('../middleware/auth');

// All the ways need to authorisetion
router.use(auth);

// Candidates CRUD
// create (just Admin)
router.post('/', adminOnly, candidateController.create);
// List of candidates
router.get('/:election_id', candidateController.getByElection);
// Details of a candidate
router.get('/detail/:id', candidateController.getOne);
// Update (just Admin)
router.put('/:id', adminOnly, candidateController.update);
// Delete (just Admin)
router.delete('/:id', adminOnly, candidateController.delete);

module.exports = router;