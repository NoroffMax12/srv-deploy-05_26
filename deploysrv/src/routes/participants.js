const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const controller = require('../controllers/participantController')

// All routes are protected by auth middleware
router.post('/add', auth, controller.addParticipant);
router.get('/', auth, controller.getParticipants);
router.get('/details', auth, controller.getDetails);
router.get('/details/:email', auth, controller.getDetailsByEmail);
router.get('/work/:email', auth, controller.getWorkByEmail);
router.get('/home/:email', auth, controller.getHomeByEmail);
router.delete('/:email', auth, controller.deleteParticipant);
router.put('/:email', auth, controller.updateParticipant);

module.exports = router;