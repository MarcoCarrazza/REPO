import React, { useState, useEffect } from 'react';
import useAuth from '../../setup/Hooks/useAuth';
import axios from '../../setup/Hooks/axios';
import { Container, Button, Stack, Row, Col, Form, Spinner, ListGroup } from 'react-bootstrap';


function MySchedule() {
  const { auth } = useAuth()
  const LOGIN_URL = '/teams/facer'
  const [date, setDate] = useState();
  const [teams, setTeams] = useState();


  useEffect(() => {
    if(!date) return
    const fetchData = async () => {
      const res = await axios.get(`${LOGIN_URL}?date=${date}`,
        {
          headers: {
            'content-type': 'application/json',
            'auth-token': auth.token
          }
        })
      return res.data
    }
    setTeams()
    fetchData().then(result => setTeams(result))
  }, [date]);

  return (
    <section>
      <Container>
        <Row>
          <Col className='justify-content-around' md={{ span: 6, offset: 3 }}>
            <h1>Cronograma</h1>
            <Form.Control type='date' onChange={(e) => setDate(e.target.value)} />
          </Col>
        </Row>
        <Row>
          <Col md={{ span: 6, offset: 3 }}>
            {!date
              ? <></>
              : !teams
                ? <Container className='d-flex justify-content-center align-items-center'><Spinner animation="border" variant="info" /></Container>
                : teams.length === 0
                  ? <h2>No haz sido asignado a ningún equipo de trabajo para este día</h2>
                  : <ListGroup>
                      <Stack gap={5}>
                        {teams === undefined || teams.length === 0 ? '' : teams.teams.map((team, index) => {
                          return (
                            <ListGroup.Item key={team.team_ID}>
                            <Stack gap={3}>
                              <Row>
                                <Col className='d-flex justify-content-between'>
                                  <h1>Equipo {index+1}: {team.team_name}</h1>
                                </Col>
                              </Row>
                              <Row>
                                <h2>Team Leader:</h2>
                                <Col className='d-flex justify-content-between'>
                                  <h3>{team.creator_name} {team.creator_surname}</h3>
                                  <Button target={"_blank"} href={`https://wa.me/${team.creator_phone}?text=Hola ${team.creator_name},`} className='bi bi-whatsapp' variant='success' />
                                </Col>
                              </Row>
                              <Row>
                                <h2>Compañer@s de equipo:</h2>
                                <ListGroup variant='flush'>
                                  {team.members.map((person, j) => {
                                    return (
                                      <ListGroup.Item key={`person${j}`}><h3>{person}</h3></ListGroup.Item>
                                    )
                                  })}
                                </ListGroup>
                              </Row>
                              <Row>
                                <h2>Lugares de trabajo:</h2>
                                <ListGroup variant='flush'>
                                  {team.workplaces.map(place => {
                                    return (
                                      <ListGroup.Item><h3 key={`place${place.placeID}`}>{place.name} | {place.reference}, {place.city}</h3></ListGroup.Item>
                                    )
                                  })}
                                </ListGroup> 
                              </Row>
                              <Row>
                                <h2>Horario de trabajo:</h2>
                                <h3>{team.start.slice(0, 5)} - {team.end.slice(0, 5)}</h3>
                              </Row>
                              <Row>
                                <h2>Mi objetivo:</h2>
                                <h3>{team.user_objetives}</h3>
                              </Row>
                              <Row>
                                <h2>Objetivos del resto del equipo:</h2>
                                <ListGroup variant='flush'>
                                  {team.team_objetives.map((objetive, k) => {
                                    return(
                                    <ListGroup.Item><h3 key={`objetive${k}`}>{objetive}</h3></ListGroup.Item>
                                    )
                                  })}
                                </ListGroup>
                              </Row>
                            </Stack>
                            </ListGroup.Item>
                          )
                        })}
                    </Stack>
                  </ListGroup>
            }

          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default MySchedule;