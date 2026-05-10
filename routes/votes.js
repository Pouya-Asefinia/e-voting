const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);

// register vote (All User)
router.post('/', voteController.castVote);

// check the status of vote
router.get('/check/:election_id', voteController.checkVoted);

// result of election (everyone can see)
router.get('/results/:election_id', voteController.getResults);

// Votes list (just Admin)
router.get('/:election_id', adminOnly, voteController.getAllVotes);

module.exports = router;
