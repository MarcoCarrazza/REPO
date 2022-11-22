const router = require('express').Router();
const { required } = require('@hapi/joi');
const { newDonValidation, deleteDonValidation, getDonValidation } = require('../middleware/validation');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const query = require('../request');
const verifyToken = require('../middleware/verifyToken');

const miDB = {
  connectionLimit: 100,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
}
dotenv.config()

//ADD NEW DONATION
router.post('/donation', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = newDonValidation(req.body)
  if (error) return res.send(error.details[0].message)

  const donation = {
    userID: req.user.id,  
    bossID: req.body.bossID,
    date: req.body.date,
    value: req.body.value,
    payment: req.body.payment,
    placeID: req.body.placeID,
    placeNameOther: req.body.placeNameOther
  }

  try{
    const rows = query(`INSERT INTO donations (user_ID, boss_ID, date, value, payment, place_ID, place_other) VALUES (?, ?, ?, ?, ?, ?, ?)`, [donation.userID, donation.bossID, donation.date, donation.value, donation.payment, donation.placeID, donation.placeNameOther])
    res.status(200).send('Donacion agregada exitosamente!')
  }catch(err){
    console.log(err);
    res.status(404).send('Error al agregar el nuevo registro')
  }
})


//DELETE A DONATION
router.delete('/donation', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = deleteDonValidation(req.body)
  if (error) return res.send(error.details[0].message)

  const donation = {
    userID: req.user.id,
    donID: req.body.donID
  }

  try{
    query("DELETE FROM donations WHERE donations.donation_ID = ? AND donations.user_ID = ?", [donation.donID, donation.userID])
    res.status(200).send('Donacion eliminada exitosamente!')
  }catch(err){
    console.log(err);
    res.status(404).send('Error al eliminar el registro')
  }
})

//GET DONATION HISTORY
router.get('/donation', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = getDonValidation(req.body)
  if (error) return res.send(error.details[0].message)

  const donation = {
    userID: req.user.id,
    startDate: req.body.startDate
  }
  
  const today = new Date().toISOString().slice(0, 10)

  try{
    const rows = await query("SELECT d.date, d.value, d.payment, d.place_ID,d.place_other, w.name, w.reference, w.city FROM donations AS d JOIN workplaces AS w ON d.place_ID = w.place_ID WHERE d.user_ID = ? AND d.date BETWEEN ? AND ? ORDER BY date DESC", [donation.userID, donation.startDate, today])
    const position = await query("SELECT user_position FROM users WHERE user_ID = ?", [donation.userID])
    const response = {
      user_ID: donation.userID,
      donations: rows
    }
    
    if (position[0].user_position == 20){
      const places = await query("SELECT place_ID, name, reference, city FROM workplaces WHERE user_ID = ?", [donation.userID])
      response.places = places
    }
    res.status(200).send(response)
  }catch(err){
    console.log(err);
    res.status(404).send('Error al obtener los registros')
  }
})

module.exports = router;