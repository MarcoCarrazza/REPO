import React, { useState, useEffect } from 'react';
import useAuth from '../../setup/Hooks/useAuth';
import axios from '../../setup/Hooks/axios';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api'
import { Container, Button, Stack, Row, Col, Spinner, ListGroup, Modal, ModalHeader, ModalBody, ModalTitle, Form, FormGroup } from 'react-bootstrap';


function Status() {
  const MySwal = withReactContent(Swal)
  const LOGIN_URL = '/timeline'
  const { auth } = useAuth()
  const [timeline, setTimeline] = useState();
  const [message, setMessage] = useState();
  const [doing, setDoing] = useState();
  const [refresh, setRefresh] = useState(0);
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState();
  const [id, setId] = useState();
  const defaultCenter = {lat: -36.671134, lng: -65.415603}
  let watchID

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBcRynnCLwomUdOHcIzXyChpEYlAx4ON2c'
  })

  const getTimeline = async (date) => {
    const res = await axios.get(`${LOGIN_URL}?date=${date}`,
      {
        headers: {
          'content-type': 'application/json',
          'auth-token': auth.token
        }
      })
    return res
  }

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    getTimeline(today).then(async result => {
      if(result.status === 200){
        setTimeline(result.data)
      } else {
        console.log(result.data);
      }
    })
  }, [refresh]);

  const handleInputChange = (e) => setMessage(e.target.value)
  
  const submitForm = async (e) => {
    e.preventDefault()
    MySwal.fire({
      title: 'Estás segur@ de marcar este estado?',
      showCancelButton: true,
      confirmButtonText: 'Si, marcar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const currentPos = {...position}
        stopWatching()
        try {
          const req = { status: doing, message: message || '-', geolocation: `${currentPos.lat}|${currentPos.lng}` }
          console.log(req);
          const res = await axios.post(LOGIN_URL,
            JSON.stringify(req),
            {
              headers: {
                'content-type': 'application/json',
                'auth-token': auth.token
              }
            })
          return res

        } catch (err) {
          console.log(err);
          MySwal.fire({
            title: 'No hemos podido registrar tu reporte. Por favor vuelve a intentarlo.',
            confirmButtonText: 'OK',
            icon: 'error'
          })
        }
      } else {
        return
      }
    }).then((response) => {
      if (!response) return
      setPosition()
      if (response.status === 200) {
        Swal.fire(response.data, '', 'success')
        setMessage('')
        setShow(!show)
        setRefresh(refresh === 1 ? 0 : 1)
      } else {
        Swal.fire(response.data, '', 'error')
      }
    })
  }

  const turnOn = () => {
    MySwal.fire({
      title: 'Debes primero "Permitir determinar tu ubicación" en tu dispositivo para poder continuar.',
      confirmButtonText: 'OK',
      icon: 'error'
    })
  }

  const startWatch = (status) => {
    setDoing(status)
    setShow(!show)
    watchID = navigator.geolocation.watchPosition(pos => {setPosition({lat: pos.coords.latitude, lng: pos.coords.longitude})}, err => turnOn(), {enableHighAccuracy: true, timeout: 10000, maximumAge: 0})
    setId(watchID)
  }

  const stopWatching = () => {
    navigator.geolocation.clearWatch(id)
    setPosition()
  }

  return (
    <section>
      <Modal show={show} onHide={() => {stopWatching(); setShow(!show)}} centered>
        <ModalHeader closeButton>
          <ModalTitle>Estás segur@ de marcar este estado?</ModalTitle>
        </ModalHeader>
        <ModalBody>
            <Form onSubmit={submitForm}>
              <Stack gap={3}>
                <FormGroup>
                  <GoogleMap mapContainerStyle={{ width: '100%', height: '50vh' }} zoom={!position ? 3 : 17} center={position || defaultCenter}>
                    {position && <MarkerF position={{lat: position.lat, lng: position.lng}} />}
                  </GoogleMap>
                </FormGroup>
                <Form.Group>
                  <Form.Label>Deseas agregar algún mensaje en este reporte?</Form.Label>
                  <Form.Control as="textarea" maxLength={500} onChange={handleInputChange} placeholder={'Su mensaje...'} />
                </Form.Group>
                <Form.Group className='d-flex justify-content-around'>
                  <Button type='button' variant='secondary' onClick={() => {stopWatching(); setShow(!show)}}>Cancelar</Button>
                  <Button type='submit' variant='primary' disabled={!position ? true : false}>Enviar</Button>
                </Form.Group>
              </Stack>
            </Form>
        </ModalBody>
      </Modal>
      <Container fluid>
        <Row className='justify-content-md-center'>
          <Col md={4}>
            <Stack gap={3}>
              <Button key='startWorking' onClick={() => startWatch(1)} variant='success'>Comenzar trabajo</Button>
              <Button key='finishWorking' onClick={() => startWatch(2)} variant='success'>Finalizar trabajo</Button>
              <Button key='startTrain' onClick={() => startWatch(3)} variant='primary'>Comenzar capacitación</Button>
              <Button key='finishTrain' onClick={() => startWatch(4)} variant='primary'>Finalizar capacitación</Button>
              <Button key='startNoCaptation' onClick={() => startWatch(5)} variant='info'>Comenzar horas sin captación</Button>
              <Button key='finishNoCaptation' onClick={() => startWatch(6)} variant='info'>Finalizar horas sin captación</Button>
            </Stack>
          </Col>
          <Col md={8}>
            <h2 key='myReport'>Mi registro de actividades de hoy:</h2>
            {!timeline
              ? <div className='d-flex justify-content-center'><Spinner animation="border" variant="info" /></div>
              : !timeline.length
                ? <h2>'No haz registrado ninguna actividad aún.'</h2>
                : <ListGroup variant='flush'>
                    {timeline.map((status, i) => {
                      return (
                        <ListGroup.Item key={i}>
                          {i < timeline.length -1
                            ? <>{status.operation.slice(11, 16) + ' hs'} - {status.description} {status.message != '-' && `| ${status.message}`}</>
                            : <><strong>{status.operation.slice(11, 16) + ' hs'} - {status.description}  (Último reporte) {status.message && `| ${status.message}`}</strong></>}
                        </ListGroup.Item>
                      )
                    })}
                  </ListGroup>}
          </Col>
        </Row>
      </Container>
    </section>

  );
}

export default Status;