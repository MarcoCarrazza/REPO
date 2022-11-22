const router = require('express').Router();
const { required } = require('@hapi/joi');
const { newPlaceValidation, deletePlaceValidation } = require('../middleware/validation');
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

//ADD NEW WORKPLACE
router.post('/workplaces', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = newPlaceValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  if(req.user.role != 20) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const place = {
    userID: req.user.id,
    name: req.body.place,
    reference: req.body.reference,
    city: req.body.city,
    geolocation: req.body.geolocation
  }

  // Check if workplace (geolocation) already exist
  const rows = await query('SELECT * FROM workplaces WHERE geolocation = ?', [place.geolocation])
  if(rows[0] != undefined) return res.status(400).send('Este lugar ya ha sido registrado anteriormente.')
  

  try{
    const rows = query("INSERT INTO workplaces (user_ID, name, reference, city, geolocation) VALUES (?, ?, ?, ?, ?)", [place.userID, place.name, place.reference, place.city, place.geolocation])
    res.status(200).send('Lugar de trabajo agregado exitosamente!')
  }catch(err){
    console.log(err);
    res.status(404).send('Error al agregar el nuevo registro')
  }
})

//DELETE A WORKPLACE
router.delete('/workplaces', verifyToken, async (req, res) => {
  if(req.user.role != 20) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const place = {
    userID: req.user.id,
    placeID: req.query.id
  }
  
  try{
    query("DELETE FROM workplaces WHERE workplaces.place_ID = ? AND workplaces.user_ID = ?", [place.placeID, place.userID])
    res.status(200).send('Lugar de trabajo eliminado exitosamente!')
  }catch(err){
    console.log(err);
    res.status(404).send('Error al eliminar el registro')
  }
})

//GET ALL WORKPLACES
router.get('/workplaces', verifyToken, async (req, res) => {
  console.log(req.user.role);
  if(req.user.role != 20) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const place = {
    userID: req.user.id,
  }
  try{
    const rows = await query("SELECT * FROM workplaces WHERE place_ID > 1 ORDER BY city, name", [place.userID])
    const response = {
      user_ID: place.userID,
      workplaces: rows
    }
    res.status(200).send(response)
  }catch(err){
    console.log(err);
    res.status(404).send('Error al obtener los registros')
  }
})

module.exports = router;