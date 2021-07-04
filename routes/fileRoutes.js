/*
    PATH: /api/file
 */

const { Router } = require('express');
const expressFileUpload = require('express-fileupload');
const { viewFile } = require('../controllers/fileController')

const router = Router();
// Lectura y parseo del body
router.use(expressFileUpload());

router.get('/:tipo/:file', viewFile)

module.exports = router;