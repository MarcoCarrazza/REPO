const router = require('express').Router();
const { required } = require('@hapi/joi');
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

//GET ALL WORKPLACES AND MY FACERS
router.get('/team-wp', verifyToken, async (req, res) => {
  if(req.user.pos != 20) return res.status(400).send('Usted no tiene permiso para acceder a esta información.')
  
  const person = {
    userID: req.user.id
  }
  
  try{
    const rows = await query("SELECT * FROM workplaces WHERE workplaces.user_ID = ? ORDER BY city, name", [person.userID])
    const rows2 = await query("SELECT ur.employee_ID, u.user_name AS facer_name, u.user_surname AS facer_surname, u.phone FROM users_relations AS ur JOIN users AS u ON ur.employee_ID = u.user_ID WHERE ur.boss_ID = ?", [person.userID])
    
    const response = {
      user_ID: person.userID,
      workplaces: rows,
      members: rows2
    }
    res.status(200).send(response)
  }catch(err){
    console.log(err);
    res.status(404).send('Error al obtener los registros')
  }
})

module.exports = router;