const router = require('express').Router();
const { required } = require('@hapi/joi');
const { updatePersonValidation, updatePasswordValidation } = require('../middleware/validation');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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


//GET USER'S PERSONAL INFO
router.get('/myaccount', verifyToken, async (req, res) => {
  
  const user = {
    userID: req.user.id
  };
  
  
  try{
   const rows = await query("SELECT user_name, user_surname, email, phone, user_city FROM users WHERE user_ID = ?;", [user.userID])
    console.log(rows);
    res.status(200).send(rows)
  } catch(err){
    res.status(400).send(`El error ha sido: ${err}`)
  }
});


//UPDATE USER'S PERSONAL INFO
router.post('/myaccount', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = updatePersonValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message);


  const user = {
    userID: req.user.id,
    email: req.body.email,
    city: req.body.city,
    phone: req.body.phone
  };
  
  
  try{
   const rows = await query("UPDATE users SET email = ?, user_city = ?, phone = ? WHERE user_ID = ?;", [user.email, user.city, user.phone, user.userID])
    if(rows.affectedRows != 1) return res.status(400).send('Lo sentimos, no hemos podido registrar los cambios.')
    res.status(200).send('Tus datos fueron actualizados exitosamente!')
  } catch(err){
    res.status(400).send(`El error ha sido: ${err}`)
  }
});


//UPDATE USER'S PASSWORD
router.post('/myaccount/pass', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = updatePasswordValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message);


  const user = {
    userID: req.user.id,
    password: req.body.password
  };
  
  //Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(user.password, salt)
  
  try{
   const rows = await query("UPDATE users SET password = ? WHERE user_ID = ?;", [hashedPassword, user.userID])
    if(rows.affectedRows != 1) return res.status(400).send('Lo sentimos, no hemos podido registrar los cambios.')
    res.status(200).send('Tus datos fueron actualizados exitosamente!')
  } catch(err){
    res.status(400).send(`El error ha sido: ${err}`)
  }
});


module.exports = router;