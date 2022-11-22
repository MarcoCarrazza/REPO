const router = require('express').Router();
const { required } = require('@hapi/joi');
const { setStatusValidation } = require('../middleware/validation');
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

//SET NEW STATUS TO TIMELINE
router.post('/timeline', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = setStatusValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  if(req.user.role != 20 && req.user.role != 10) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const user = {
    userID: req.user.id,
    status: req.body.status,
    message: req.body.message,
    geolocation: req.body.geolocation
  }
  
  try{
    const rows = query("INSERT INTO user_timeline (user_ID, status, message, geolocation) VALUES (?, ?, ?, ?)", [user.userID, user.status, user.message, user.geolocation])
    console.log(rows);
    res.status(200).send('Registro realizado exitosamente!')
  }catch(err){
    console.log(err);
    res.status(404).send('Error al agregar el nuevo registro')
  }
})


//GET USER'S TODAY TIMELINE
router.get('/timeline', verifyToken, async (req, res) => {
  if(req.user.role != 20 && req.user.role != 10) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const user = {
    userID: req.user.id,
    date: req.query.date
  }
  
  try{
    const rows = await query("SELECT s.description, ut.operation, ut.message FROM user_timeline AS ut JOIN status AS s ON ut.status = s.status_ID WHERE ut.user_ID = ? AND ut.operation LIKE ? ORDER BY ut.operation", [user.userID, user.date+'%'])
    console.log(rows);
    res.status(200).send(rows)
  }catch(err){
    console.log(err);
    res.status(404).send('Error al agregar el nuevo registro')
  }
})


//GET TODAY TIMELINE REPORT FOR RRHH
router.get('/timeline/report', verifyToken, async (req, res) => {
  if(req.user.role != 30) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const user = {
    userID: req.query.id,
    date: req.query.date
  }
  
  try{
    const rows = await query("SELECT s.description, ut.operation, ut.message, ut.geolocation FROM user_timeline AS ut JOIN status AS s ON ut.status = s.status_ID WHERE ut.user_ID = ? AND ut.operation LIKE ? ORDER BY ut.operation", [user.userID, user.date+'%'])
    const rows2 = await query(`SELECT ut.team_ID, t.team_name, t.start, t.end, w.geolocation
    FROM user_team AS ut
    LEFT JOIN teams as t ON ut.team_ID = t.team_ID
    LEFT JOIN workplace_team AS wt ON ut.team_ID = wt.team_ID
    LEFT JOIN workplaces AS w ON wt.place_ID = w.place_ID
    WHERE ut.user_ID = ? AND t.date = ?`, [user.userID, user.date])

    const response = {
      teams: rows2,
      report: rows
    }
    console.log(response);
    res.status(200).send(response)
  }catch(err){
    console.log(err);
    res.status(404).send('Error al intentar obtener los datos.')
  }
})

module.exports = router;