const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);

// Participants CRUD
// Add a participant (Just Admin)
router.post('/', adminOnly, participantController.add);
// Add multiple participants (Just Admin)
router.post('/bulk', adminOnly, participantController.addBulk);
// participants list in an election
router.get('/election/:election_id', participantController.getByElection);
// A user election list
router.get('/user/:user_id', participantController.getByUser);
// Participants List (For chois in Admin panel)
router.get('/users', participantController.getUsers);
// Delete participant (Just Admin)
router.delete('/:election_id/:user_id', adminOnly, participantController.remove);

module.exports = router;