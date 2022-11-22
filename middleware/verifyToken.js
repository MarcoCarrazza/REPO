const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config()

module.exports = (req, res, next) => {
  const token = req.header('auth-token')
  if(!token) return res.status(401).send('Acceso denegado')

  try{
    const verified = jwt.verify(token, process.env.S_TOKEN)
    if(verified === false) return res.status(401).send('Token incorrecto')
    const user = jwt.decode(token, process.env.S_TOKEN)
    req.user = {id: user.id, role: user.role}
    next()
  } catch(err){
    res.status(400).send('Token invalido')
  }
}