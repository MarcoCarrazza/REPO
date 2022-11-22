// const { json } = require('express');

const router = require('express').Router();
// const { required } = require('@hapi/joi');
// const { newDonValidation, deleteDonValidation, getDonValidation } = require('../middleware/validation');
// const mysql = require('mysql');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// const query = require('../request');
// const verifyToken = require('../middleware/verifyToken');

router.post('/prueba', (req, res) => {
  console.log( req.body);
  const respuesta = {respuesta: 'Conectado a servidor'}
  res.status(200).redirect('/frontend/src/pages/tl/tlWorkPlaces.html')
})

module.exports = router;