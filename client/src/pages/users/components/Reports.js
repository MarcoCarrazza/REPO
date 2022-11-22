import React, { useState, useEffect } from 'react';
import useAuth from '../../../setup/Hooks/useAuth';
import axios from '../../../setup/Hooks/axios';
import pin from '../../../assets/images/personGPS.png'
import pointer from '../../../assets/images/pointerGPS.png'
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api'
import { Button, Form, Row, Col, Stack, ListGroup, Spinner, Modal, ModalHeader, ModalBody, ModalTitle, ModalFooter, Container } from 'react-bootstrap';


function Reports({ user, reset }) {
  const dotenv = require('dotenv');
  dotenv.config()
  const { auth } = useAuth()
  const LOGIN_URL = '/timeline'
  const [report, setReport] = useState();
  const [date, setDate] = useState();
  const [geo, setGeo] = useState();
  const defaultCenter = {lat: -36.671134, lng: -65.415603}
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBcRynnCLwomUdOHcIzXyChpEYlAx4ON2c'
  })

  const fetchData = async () => {
    const res = await axios.get(`${LOGIN_URL}/report?id=${user}&date=${date}`,
      {
        headers: {
          'content-type': 'application/json',
          'auth-token': auth.token
        }
      })
    console.log(res.data);
    res.data.report.forEach(pos => {
      const latLng = pos.geolocation.split('|')
      pos.lat = Number(latLng[0])
      pos.lng = Number(latLng[1])
    });
    res.data.teams.forEach(team => {
      const latLng = team.geolocation.split('|')
      team.lat = Number(latLng[0])
      team.lng = Number(latLng[1])
    });
    return res.data
  }

  useEffect(() => {
    if (!user) return
    if (!date) return
    setReport()
    setGeo()
    fetchData().then(result => setReport(result))
  }, [date]);

  const updateMap = (i) => {
    setGeo({ lat: report.report[i].lat, lng: report.report[i].lng, label: i })
  }

  const closeReport = () => {
    setDate()
    setReport()
    reset()
  }

  return (
    <Modal show={user && true} onHide={closeReport} fullscreen={true}>
      <ModalHeader closeButton>
        <ModalTitle>Reporte de estado del usuario</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col md={6}>
            <Stack gap={3}>
              <Form.Control type='date' onChange={(e) => setDate(e.target.value)} />
              {!date
                ? 'Selecione una fecha para ver los reportes.'
                : !report
                  ? <Container className='d-flex justify-content-center align-items-center'><Spinner animation="border" variant="info" /></Container>
                  : <Container>
                      <Stack gap={4}>
                        <Row>
                          <h2>Equipos designados:</h2>
                          <ListGroup variant="flush">
                            {report.teams.length === 0  && <h3>No existen equipos asignados para este día.</h3>}
                            {report.teams.map((team, i) => {
                                return (
                                  <ListGroup.Item>
                                    <Col className='d-flex justify-content-between'>
                                      <h3 key={'team' + i}>Equipo: {team.team_name} | Horario:<strong>{team.start.slice(0,5)} - {team.end.slice(0,5)} hs</strong></h3>
                                    </Col>
                                  </ListGroup.Item>
                                )})}
                          </ListGroup>
                        </Row>
                        <Row>
                          <h2>Reporte del usuario:</h2>
                          <ListGroup variant="flush">
                            {report.report.length === 0  && <h3><strong>No existe reporte del usuario para este día.</strong></h3>}
                            {report.report.map((rep, i) => {
                                return (
                                  <ListGroup.Item>
                                    <Col className='d-flex justify-content-between'>
                                      <h3 key={'rep' + i}>{rep.operation.slice(11, 16)} hs - {rep.description} {rep.message != '-' && `(Msj: ${rep.message})`}</h3>
                                      <Button id={i} key={'mapa' + i} value={rep.geolocation} onClick={e => updateMap(e.target.id)} size="sm" variant='primary'>Mapa</Button>
                                    </Col>
                                  </ListGroup.Item>
                                )
                              })}
                          </ListGroup>
                        </Row>
                      </Stack>
                    </Container>
              }
            </Stack>
          </Col>
          <Col md={6}>
            <GoogleMap mapContainerStyle={{ width: '100%', height: '50vh' }} zoom={!geo ? 3 : 15} center={!geo ? defaultCenter : geo}>
              {report && report.teams.map(team => <MarkerF position={{lat: team.lat, lng: team.lng}} icon={pointer} />)}
              {report && report.report.map(rep => <MarkerF position={{lat: rep.lat, lng: rep.lng}} icon={pin} />)}
            </GoogleMap>
          </Col>
        </Row> 
      </ModalBody>
      <ModalFooter>
        <Button className='justify-content-center' type='button' variant='secondary' onClick={() => closeReport()}>Salir</Button>
      </ModalFooter>
    </Modal>
  );
}

export default Reports;