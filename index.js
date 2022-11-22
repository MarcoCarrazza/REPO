const express = require('express');
const app = express();
const dotenv = require('dotenv');
const corsMiddleware = require('./middleware/cors');
const path = require('path')
const cors = require('cors');

//Import Routes
const authRoute = require('./routes/auth');
const donation = require('./routes/donation')
const workplaces = require('./routes/workplaces')
const teams = require('./routes/teams')
const myTeam = require('./routes/myTeam')
const team_wp = require('./routes/facers-workplaces')
const timeline = require('./routes/timeline')
const users = require('./routes/users')
const myAccount = require('./routes/myaccount')
const prueba = require('./routes/prueba')

//Middlewares
app.use(express.json());
// app.use(corsMiddleware);
app.use(cors())

//Route Middlewares
app.use('/api/user', authRoute)
app.use('/api', donation)
app.use('/api', workplaces)
app.use('/api', teams)
app.use('/api', myTeam)
app.use('/api', team_wp)
app.use('/api', timeline)
app.use('/api', users)
app.use('/api', myAccount)
app.use('/api', prueba)

if(process.env.NODE_ENV === 'production'){
  app.use(express.static('client/build'))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
  })
}

app.listen(process.env.PORT || 5500, () => console.log('Servidor corriendo!'))
// app.listen(5500, () => console.log('Servidor corriendo!'))