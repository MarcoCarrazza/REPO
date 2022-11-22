const router = require('express').Router();
const { required } = require('@hapi/joi');
const { newPersonValidation, editPersonValidation, updateBossesValidation } = require('../middleware/validation');
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

//GET ALL USERS
router.get('/users', verifyToken, async (req, res) => {
  if(req.user.role != 30) return res.status(400).send('Usted no tiene los permisos necesarios.')

  try{
    const rows = await query("SELECT * FROM users WHERE status = 1 ORDER BY user_surname, user_name", [])
    const response = {
      users: rows
    }
    res.status(200).send(response)
  }catch(err){
    console.log(err);
    res.status(404).send('Error al obtener los registros')
  }
})

//ADD NEW USER
router.post('/users', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = newPersonValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message);
  
  // Check if user is able to create a new user
  if(req.user.role != 30) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const user = {
    name: req.body.userName,
    surname: req.body.userSurname,
    dni: req.body.dni,
    email: req.body.email,
    city: req.body.city,
    role: req.body.role,
    phone: req.body.phone
  };
  

  // Check if email already exist
  const rows = await query('SELECT * FROM users WHERE email = ?', [user.email])
  if(rows[0] != undefined) return res.status(400).send('Ya existe un usuario registrado con este email')
  
  //Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash('admin', salt)
  
  try{
    const rows2 = await query("INSERT INTO users (user_name, user_surname, dni, email, user_city, user_role, phone, status, password) VALUES (?, ?, ?, ?, ?, ? , ? , ?, ?)", [user.name, user.surname, user.dni, user.email, user.city, user.role, user.phone, 1, hashedPassword])
    if(rows2.affectedRows != 1) return res.status(400).send('Lo sentimos, no hemos podido registrar el usuario.')
    res.status(200).send('Usuario registrado!')
  } catch(err){
    res.status(400).send(`El error ha sido: ${err}`)
  }
});

//UPDATE A USER
router.put('/users', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = editPersonValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message);

  // Check if user is able to update a user
  if(req.user.role != 30) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const user = {
    userID: req.body.userID,
    name: req.body.userName,
    surname: req.body.userSurname,
    email: req.body.email,
    city: req.body.city,
    role: req.body.role,
    phone: req.body.phone
  };
  
  
  try{
   const rows = await query("UPDATE users SET user_name = ?, user_surname = ?, email = ?, user_city = ?, user_role = ?, phone = ? WHERE users.user_ID = ?;", [user.name, user.surname, user.email, user.city, user.role, user.phone, user.userID])
    console.log(rows);
    if(rows.affectedRows != 1) return res.status(400).send('Lo sentimos, no hemos podido registrar el usuario.')
    res.status(200).send('Los datos del usuario fueron actualizados exitosamente!')
  } catch(err){
    res.status(400).send(`El error ha sido: ${err}`)
  }
});

//RESET USER'S PASSWORD
router.post('/users/pass', verifyToken, async (req, res) => {

  if(req.user.role != 30) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const user = {
    userID: req.query.id
  }

  //Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash('admin', salt)

  try{
    // query("DELETE FROM users WHERE user_ID = ?", [user.userID])
    query("UPDATE users SET password = ? WHERE user_ID = ?", [hashedPassword, user.userID])
    res.status(200).send("La contraseña se ha blanqueado exitosamente! Recuerde informar al usuario que su nueva contraseña es 'admin'.")
  }catch(err){
    console.log(err);
    res.status(404).send('Error al blanquear la contraseña')
  }
})

//DELETE A USER
router.delete('/users', verifyToken, async (req, res) => {
  if(req.user.role != 30) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const user = {
    userID: req.query.id
  }
  
  try{
    query("UPDATE users SET status = 0 WHERE user_ID = ?", [user.userID])
    res.status(200).send('Usuario eliminado exitosamente!')
  }catch(err){
    console.log(err);
    res.status(404).send('Error al eliminar el registro')
  }
})

//GET ALL ROLES
router.get('/users/roles', verifyToken, async (req, res) => {
  if(req.user.role != 30) return res.status(400).send('Usted no tiene los permisos necesarios.')

  try{
    const rows = await query("SELECT * FROM roles WHERE role_ID >= ?", [10])
    const response = {
      roles: rows
    }
    res.status(200).send(response)
  }catch(err){
    console.log(err);
    res.status(404).send('Error al obtener los registros')
  }
})

//GET ALL USER'S BOSSES AND FACERS
router.get('/users/boss', verifyToken, async (req, res) => {
  if(req.user.role != 30) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const user = {
    userID: req.query.id
  };

  try{
    const rows = await query("SELECT user_ID, user_name, user_surname FROM users WHERE user_role = ? AND user_ID <> ?", [20, user.userID])
    const rows2 = await query("SELECT user_ID, user_name, user_surname FROM users WHERE user_role = ? AND user_ID <> ?", [10, user.userID])
    const rows3 = await query("SELECT ur.boss_ID, u.user_name, u.user_surname FROM users_relations AS ur JOIN users AS u ON ur.boss_ID = u.user_ID WHERE ur.employee_ID = ?", [user.userID])
    const rows4 = await query("SELECT ur.employee_ID, u.user_name, u.user_surname FROM users_relations AS ur JOIN users AS u ON ur.employee_ID = u.user_ID WHERE ur.boss_ID = ?", [user.userID])
    
    const response = {
      bosses: rows,
      facers: rows2,
      currentBoss: rows3,
      currentFacer: rows4
    }
    res.status(200).send(response)
  }catch(err){
    console.log(err);
    res.status(404).send('Error al obtener los registros')
  }
})

//UPDATE USER'S BOSSES AND FACERS
router.post('/users/user', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = updateBossesValidation(req.body)
  // if (error) return res.status(400).send(error.details[0].message);
  
  // Check if user is able to create a new user
  if(req.user.role != 30) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const user = {
    userID: req.body.userID,
    bosses: req.body.bosses,
    facers: req.body.facers
  };
 
  let relations = []
  let qty = ""
  user.bosses.forEach((boss, i) => {
    relations.push(boss)
    relations.push(user.userID)
    i === 0 ? qty += "(?, ?)" : qty += ", (?, ?)"
  })
  let relations2 = []
  let qty2 = ""
  user.facers.forEach((facer, i) => {
    relations2.push(user.userID)
    relations2.push(facer)
    i === 0 ? qty2 += "(?, ?)" : qty2 += ", (?, ?)"
  })
  
  try{
    const rows = await query("DELETE FROM users_relations WHERE employee_ID = ? OR boss_ID = ?", [user.userID, user.userID])
    if(user.bosses.length > 0){
      const rows2 = await query(`INSERT INTO users_relations (boss_ID, employee_ID) VALUES ${qty};`, [...relations])
    }
    if(user.facers.length > 0){
      const rows3 = await query(`INSERT INTO users_relations (boss_ID, employee_ID) VALUES ${qty2};`, [...relations2])
    }
    res.status(200).send('Los cambios se realizaron exitosamente!')
    
  } catch(err){
    res.status(400).send(`El error ha sido: ${err}`)
  }
});

module.exports = router;