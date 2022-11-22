const router = require('express').Router();
const { required } = require('@hapi/joi');
const { newTeamValidation, deleteTeamValidation, getTeamValidation } = require('../middleware/validation');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const query = require('../request');
const verifyToken = require('../middleware/verifyToken');
const { empty } = require('@hapi/joi/lib/base');

const miDB = {
  connectionLimit: 100,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
}
dotenv.config()

//ADD NEW TEAM
router.post('/teams', verifyToken, async (req, res) => {
  //Validate the req.body using Joi
  const { error } = newTeamValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)
 
  if(req.user.role != 20) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const team = {
    userID: req.user.id,
    name: req.body.name,
    date: req.body.date,
    places: req.body.workplaces,
    persons: req.body.members,
    startTime: req.body.worktime.start,
    endTime: req.body.worktime.end
  }

  try{
    // Insert new team in DB
    const rows = await query(`INSERT INTO teams (team_name, date, start, end, creator_ID) VALUES (?, ?, ?, ?, ?)`, [team.name, team.date, team.startTime, team.endTime, team.userID])
    const lastInserted = rows.insertId

    // Insert user-team rows in DB
    const arrPerson = []
    let values = ""
    team.persons.forEach((person, i) => {
      arrPerson.push(person.user_ID)
      arrPerson.push(lastInserted)
      arrPerson.push(person.objetive)
      i === 0 ? values += "(?, ?, ?)" : values += ", (?, ?, ?)"
    });
    
    const rows2 = await query(`INSERT INTO user_team (user_ID, team_ID, user_objetives) VALUES ${values}`, [...arrPerson])

    // Insert place-team rows in DB
    const arrPlace = []
    let valuesP = ""
    team.places.forEach((place, i) => {
      arrPlace.push(place)
      arrPlace.push(lastInserted)
      i === 0 ? valuesP += "(?, ?)" : valuesP += ", (?, ?)"
    });
    
    const rows3 = await query(`INSERT INTO workplace_team (place_ID, team_ID) VALUES ${valuesP}`, [...arrPlace])
 

    if(rows.affectedRows>0 && rows2.affectedRows>0 && rows3.affectedRows>0){
      res.status(200).send('Equipo de trabajo agregado exitosamente!')
    } else {
      res.status(400).send('No pudo agregarse el equipo :(')
    }
  }catch(err){
    console.log(err);
    res.status(404).send('Error al agregar el nuevo registro')
  }
})


//DELETE A TEAM
router.delete('/teams/tl', verifyToken, async (req, res) => {
  if(req.user.role != 20) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const team = {
    userID: req.user.id,
    teamID: req.query.team
  }

  try{
    const rows = await query("DELETE FROM teams WHERE team_ID = ? AND creator_ID = ?", [team.teamID, team.userID])
    
    if(rows.affectedRows === 1){
      res.status(200).send('Equipo de trabajo fue eliminado exitosamente!')
    } else {
      res.status(400).send('Ningun equipo fue eliminado!')
    }
  }catch(err){
    console.log(err);
    res.status(404).send('Error al eliminar el registro')
  }
})


//GET ALL TEAMS FOR FACER AND TL
router.get('/teams/facer', verifyToken, async (req, res) => {
  if(req.user.role != 10 && req.user.role != 20) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const team = {
    userID: req.user.id,
    date: req.query.date
  }

  try{
    // Get all teams for the team.userID
    const rows = await query(`SELECT ut.user_ID, t.team_ID, t.team_name, t.date, t.start, t.end, t.creator_ID, u.user_name AS creator_name, u.user_surname AS creator_surname, u.phone AS creator_phone, ut.user_objetives
    FROM teams AS t JOIN user_team AS ut ON t.team_ID = ut.team_ID
    LEFT JOIN users AS u ON t.creator_ID = u.user_ID
    WHERE ut.user_ID = ? AND t.date = ?;`, [team.userID, team.date])
    if(rows.length == 0) return res.status(200).send(rows)
    
    // Get all users's objetives for all the teams searched before
    const teams = rows.map(team => team.team_ID)
    let qty = ""
    teams.forEach((team, i) => {
      i === 0 ? qty += "?" : qty += ",?"
    })
    
    // Get list of users's objetives from each team he is a member
    const rows2 = await query(`SELECT * FROM user_team AS ut JOIN users AS u ON ut.user_ID = u.user_ID WHERE team_ID IN (${qty})`, [...teams])
    
    // Get list of teams's places
    const rows3 = await query(`SELECT wt.place_ID, w.name, w.reference, w.city, wt.team_ID FROM workplace_team AS wt JOIN workplaces AS w ON wt.place_ID = w.place_ID WHERE team_ID IN (${qty})`, [...teams])
    
    
    // Insert the each team's objetives in each team
    teams.forEach((teamN, i) => {
      rows[i].team_objetives = rows2.filter(obj => obj.team_ID == teamN && obj.user_ID != team.userID).map(obj => obj.user_objetives)
      rows[i].members = rows2.filter(obj => obj.team_ID == teamN && obj.user_ID != team.userID).map(obj => `${obj.user_name} ${obj.user_surname}`)
    })
    
    
    // Insert the each team's worplaces in each team
    teams.forEach((teamN, i) => {
      rows[i].workplaces = rows3.filter(obj => obj.team_ID == teamN).map(obj => {
        return {
          placeID: obj.place_ID,
          name: obj.name,
          reference: obj.reference,
          city: obj.city
        }
      })
    })
    
    const response = {
      user_ID: team.userID,
      date: team.date,
      teams: rows
    }
    res.status(200).send(response)
  }catch(err){
    console.log(err);
    res.status(404).send('Error al obtener los registros')
  }
})


//GET ALL TEAMS FOR TL
router.get('/teams/tl', verifyToken, async (req, res) => {
  if(req.user.role != 20) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const team = {
    userID: req.user.id,
    date: req.query.date
  }
  
  try{
    // Get all teams requested by user
    const rows = await query("SELECT creator_ID, team_ID, team_name, date, start, end FROM teams WHERE creator_ID = ? AND date = ?", [team.userID, team.date])
    if(rows.length === 0) return res.status(200).send(rows)

    // Array with teamsID listed
    const teams = rows.map(teamN => teamN.team_ID)
    let qty = ""
    teams.forEach((team, i) => {
      i === 0 ? qty += "?" : qty += ",?"
    })
    
    // Get list of teams's members
    const rows2 = await query(`SELECT ut.user_ID, u.user_name, u.user_surname, ut.user_objetives, u.phone, ut.team_ID FROM user_team AS ut JOIN users AS u ON ut.user_ID = u.user_ID WHERE team_ID IN (${qty})`, [...teams])
    
    // Get list of teams's places
    const rows3 = await query(`SELECT wt.place_ID, w.name, w.reference, w.city, wt.team_ID FROM workplace_team AS wt JOIN workplaces AS w ON wt.place_ID = w.place_ID WHERE team_ID IN (${qty})`, [...teams])
    

    // Insert the each team'places in each team
    teams.forEach((teamN, i) => {
      rows[i].members = rows2.filter(obj => obj.team_ID == teamN).map(obj => {
        return {
          userID: obj.user_ID,
          name: obj.user_name,
          surname: obj.user_surname,
          objetive: obj.user_objetives,
          phone: obj.phone
        }
      })
    })

    // Insert the each team'member in each team
    teams.forEach((teamN, i) => {
      rows[i].workplaces = rows3.filter(obj => obj.team_ID == teamN).map(obj => {
        return {
          name: obj.name,
          reference: obj.reference,
          city: obj.city
        }
      })
    })

    const response = {
      user_ID: team.userID,
      date: team.date,
      teams: rows
    }
    console.log('consulto',response);
    res.status(200).send(response)
  }catch(err){
    console.log(err);
    res.status(404).send('Error al obtener los registros')
  }
})


//GET ALL USERS-WORKPLACES OF A TEAM LEADER
router.get('/teamplace', verifyToken, async (req, res) => {
  if(req.user.role != 20) return res.status(400).send('Usted no tiene los permisos necesarios.')

  const person = {
    userID: req.user.id,
  }
  
  try{
    const rows1 = await query("SELECT ur.employee_ID, u.user_name AS facer_name, u.user_surname AS facer_surname FROM users_relations AS ur JOIN users AS u ON ur.employee_ID = u.user_ID WHERE ur.boss_ID = ?", [person.userID])
    const rows2 = await query("SELECT * FROM workplaces WHERE place_ID > 1 ORDER BY city, name", [person.userID])
    const response = {
      user_ID: person.userID,
      members: rows1,
      workplaces: rows2
    }
    res.status(200).send(response)
  }catch(err){
    console.log(err);
    res.status(404).send('Error al obtener el listado de usuarios.')
  }
})


module.exports = router;