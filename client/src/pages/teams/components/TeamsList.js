import React, { useState, useEffect } from 'react';
import useAuth from '../../../setup/Hooks/useAuth';
import axios from '../../../setup/Hooks/axios';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';
import { Button, Form, Stack, Container, Row, Col, ListGroup, Spinner, Badge } from 'react-bootstrap';


function TeamsList({ refresh, reset }) {
  const MySwal = withReactContent(Swal)
  const [date, setDate] = useState();
  const [teams, setTeams] = useState();
  const { auth } = useAuth()
  const LOGIN_URL = '/teams/tl'


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

  useEffect(() => {
    setTeams()
    fetchData().then(result => setTeams(result))
  }, [date, refresh]);

  const deleteTeam = (e) => {
    console.log('elimino team: ', e.target.id);
    MySwal.fire({
      icon: 'warning',
      title: 'Estás segur@ de eliminar este equipo?',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await axios.delete(`${LOGIN_URL}?team=${e.target.id}`,
          {
            headers: {
              'content-type': 'application/json',
              'auth-token': auth.token
            }
          })
        console.log(res);
        return res
      } else {
        return 0
      }
    }).then(response => {
      if(response === 0) return 0
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: response.data,
          confirmButtonText: 'OK',
        })
        reset()
        return response.status
      } else {
        Swal.fire(response.data, '', 'error')
      }
    })
  }

  return (
    <Container>
    <Col md={{ span: 6, offset: 3 }}>
      <Form.Label htmlFor='date'>Seleccione la fecha para ver los equipos programados:</Form.Label>
      <Stack gap={8}>
      <Form.Control name='date' id='date' type='date' onChange={(e) => setDate(e.target.value)} />
      {!date
        ? <></>
        : !teams
          ? <Container className='d-flex justify-content-center align-items-center'><Spinner animation="border" variant="info" /></Container>
          : teams.length === 0
            ? <h2>No existen equipos programados para este día</h2>
            : <ListGroup>
                <Stack gap={5}>
                  {teams === undefined || teams.length === 0 ? '' : teams.teams.map((team, index) => {
                    return (
                      <ListGroup.Item key={`team${team.team_ID}`}>
                        <Stack gap={3}>
                        <Row>
                          <Col className='d-flex justify-content-between'>
                            <h1>Equipo {index+1}: {team.team_name}</h1>
                            <Button type='button' id={team.team_ID} key={`delete${team.team_ID}`} onClick={deleteTeam} variant='outline-danger' className='bi bi-trash3-fill' />
                          </Col>
                        </Row>
                        <Row>
                          <h2>Integrantes:</h2>
                          <ListGroup variant="flush">
                            {team.members.map(person => {
                              return (
                                <>
                                  <ListGroup.Item>
                                    <Row>
                                      <Col className='d-flex justify-content-between'>
                                        <h3 key={`person${index}${person.userID}`} className="fw-bold">{person.name} {person.surname}</h3>
                                        <Button target={"_blank"} href={`https://wa.me/${person.phone}?text=Hola ${person.name}, te he asignado a un equipo de trabajo para el día ${team.date.slice(8, 10)}/${team.date.slice(5, 7)}/${team.date.slice(0, 4)}.`} className='bi bi-whatsapp' variant='success' />
                                      </Col>
                                    </Row>
                                      <h3>{person.objetive}</h3>
                                    <Row>
                                    </Row>
                                  </ListGroup.Item>
                                </>
                              )
                            })}
                          </ListGroup>
                        </Row>
                        <Row>
                        <h2>Lugares de trabajo:</h2>
                        <ListGroup variant="flush">
                          {team.workplaces.map(place => {
                            return (
                              <>
                                <ListGroup.Item key={`place${index}${place.placeID}`}>
                                  <h3>{place.name} | {place.reference}, {place.city}</h3>
                                </ListGroup.Item>
                              </>
                            )
                          })}
                        </ListGroup>
                        </Row>
                        <Row>
                          <h2>Horario de trabajo:</h2>
                          <h3>{team.start.slice(0, 5)} - {team.end.slice(0, 5)}</h3>
                        </Row>
                        </Stack>
                      </ListGroup.Item>
                    )
                  })}
                </Stack>
              </ListGroup>
      }
      </Stack>
    </Col>
    </Container>
  );
}

export default TeamsList;