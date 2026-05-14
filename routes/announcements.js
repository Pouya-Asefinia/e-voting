const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);

// Announcement CRUD
// Create (just Admin)
router.post('/', adminOnly, announcementController.create);
// List of All
router.get('/', announcementController.getAll);
// Active announcement (for Home page)
router.get('/active', announcementController.getActive);
// Details of one
router.get('/:id', announcementController.getOne);
// Update (Just Admin)
router.put('/:id', adminOnly, announcementController.update);
// Delete (Just Admin)
router.delete('/:id', adminOnly, announcementController.delete);

module.exports = router;