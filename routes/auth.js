const router = require('express').Router();
const { required } = require('@hapi/joi');
const mysql = require('mysql');
const { registerValidation, loginValidation } = require('../middleware/validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const query = require('../request');

const miDB = {
  connectionLimit: 100,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
}
dotenv.config()

//REGISTER A USER BY SIGN-UP FORM (NO ESTA EN USO)
router.post('/register', async (req, res) => {
  //Validate the req.body using Joi
  const { error } = registerValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message);
  
  const user = {
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    city: req.body.city,
    role: req.body.role,
    phone: req.body.phone
  };
  
  // Check if user is able to create a new user
  if(req.user.role != 30) return res.status(400).send('Usted no tiene los permisos necesarios.')

  // Check if email already exist
  const rows = await query('SELECT * FROM users WHERE email = ?', [user.email])
  if(rows[0] != undefined) return res.status(400).send('Este mail ya se encuentra registrado')
  
  //Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash('admin', salt)
  
  try{
    const rows2 = await query("INSERT INTO users (user_name, user_surname, email, user_city, user_role, phone, status, password) VALUES (?, ?, ?, ? , ? , ? , ?, ?)", [user.name, user.surname, user.email, user.city, user.role, user.phone, 1, hashedPassword])
    if(rows2.affectedRows != 1) return res.status(400).send('Lo sentimos, no hemos podido registrar el usuario.')
    res.status(200).send('Usuario registrado!')
  } catch(err){
    res.status(400).send(`El error ha sido: ${err}`)
  }
});

//LOGIN A USER
router.post('/login', async (req, res) => {
  //Validate the req.body using Joi
  console.log(req.body);
  const { error } = loginValidation(req.body)
  
  if (error) return res.send(error.details[0].message);
  const user = {
    dni: req.body.dni,
    password: req.body.password
  };

  const userDB = await query('SELECT user_ID, email, password, status, user_role FROM users WHERE dni = ?', [user.dni])
  
  //Verify if email exist in DB
  if(userDB[0] === undefined) return res.status(400).send('El DNI o la contraseña son incorrectos :(')
  
  //Verify if user's status = able
  if(userDB[0].status == 0) return res.status(401).send('Usuario denegado.')
  
  //Verify password
  const validPass = await bcrypt.compare(user.password, userDB[0].password)
  if(!validPass) return res.status(400).send('El DNI o la contraseña son incorrectos :(')
  
  //Create token
  const token = jwt.sign({id: userDB[0].user_ID, role: userDB[0].user_role}, process.env.S_TOKEN)
  res.status(200).header('auth-token', token).send({userID: userDB[0].user_ID, token: token, role: userDB[0].user_role})
  
})

module.exports = router;