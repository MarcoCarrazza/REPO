const router = require('express').Router();
const { required } = require('@hapi/joi');
const { newPersonValidation, deletePersonValidation } = require('../middleware/validation');
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


//GET ALL USERS OF A TEAM LEADER
router.get('/myteam', verifyToken, async (req, res) => {
  if(req.user.role != 20) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const person = {
    userID: req.user.id,
  }
  
  try{
    const rows = await query("SELECT ur.employee_ID, u.user_name AS facer_name, u.user_surname AS facer_surname, u.phone FROM users_relations AS ur JOIN users AS u ON ur.employee_ID = u.user_ID WHERE ur.boss_ID = ?", [person.userID])
    console.log(rows);
    const response = {
      user_ID: person.userID,
      members: rows
    }
    res.status(200).send(response)
  }catch(err){
    console.log(err);
    res.status(404).send('Error al obtener el listado de usuarios.')
  }
})

//ADD NEW USER BY RRHH
router.post('/myteamRH', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = newPersonValidation(req.body)
  if (error) return res.send(error.details[0].message)
  if(req.user.pos != 30) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const person = {
    userName: req.body.userName,
    userSurame: req.body.userSurname,
    mail: req.body.mail,
    position: req.body.position,
    city: req.body.city
  }

  try{
    const rows = query("INSERT INTO users (email, user_name, user_surname, user_city, user_position, status) VALUES (?, ?, ?, ?, ?, ?)", [person.email, person.userName, person.userSurname, person.city, person.position, 1])
    res.status(200).send('El nuevo usuario ha sido creado exitosamente!')
  }catch(err){
    console.log(err);
    res.status(404).send('Error al crear el nuevo usuario')
  }
})


//DELETE A USER BY RRHH (delete forever)
router.delete('/myteamRH', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = deletePersonValidation(req.body)
  if (error) return res.send(error.details[0].message)
  if(req.user.pos != 30) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const person = {
    userID: req.user.id,
    deletedPersonID: req.body.deletedPersonID
  }

  try{
      const rows = await query("UPDATE users SET status = ? WHERE user_ID = ?", [0, person.deletedPersonID])
      if(rows.affectedRows == 1){
        res.status(200).send('El usuario ha sido eliminado exitosamente!')
      } else {
        res.status(400).send('Lo sentimos, no hemos podido eliminar el usuario.')
      }
  }catch(err){
    console.log(err);
    res.status(404).send('Error al eliminar el registro')
  }
})



module.exports = router;