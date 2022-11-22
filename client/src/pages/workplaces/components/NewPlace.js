import React, { useState } from 'react';
import useAuth from '../../../setup/Hooks/useAuth';
import axios from '../../../setup/Hooks/axios';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import pointer from '../../../assets/images/pointerGPS.png'
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api'
import { Button, Form, Row, Col, Stack, Modal, ModalHeader, ModalBody, ModalTitle } from 'react-bootstrap';

function NewPlace({ visibility, show, reset, placeList }) {
  const dotenv = require('dotenv');
  
  dotenv.config()

  const MySwal = withReactContent(Swal)
  const [data, setData] = useState({ place: '', reference: '', city: '' });
  const { auth } = useAuth()
  const LOGIN_URL = '/workplaces'
  const [geo, setGeo] = useState();
  const defaultCenter = {lat: -36.671134, lng: -65.415603}

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBcRynnCLwomUdOHcIzXyChpEYlAx4ON2c'
  })

  const handleInputChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    })
  }

  const newPoint = (e) => {
    setGeo({lat: e.latLng.lat(), lng: e.latLng.lng()})
  }

  const submitForm = async (e) => {
    e.preventDefault()
    if(!geo) return alert('Debe seleccionar un lugar en el mapa antes de continuar.')
    data.geolocation = `${geo.lat}|${geo.lng}`
    MySwal.fire({
      title: 'Estás segur@ de agregar este lugar de trabajo?',
      showCancelButton: true,
      confirmButtonText: 'Si, agregar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await axios.post(LOGIN_URL,
          JSON.stringify(data),
          {
            headers: {
              'content-type': 'application/json',
              'auth-token': auth.token
            }
          })
        return res
      } else {
        return
      }
    }).then((response) => {
      if (!response) return
      if (response.status === 200) {
        Swal.fire(response.data, '', 'success')
        reset()
        show()
      } else {
        Swal.fire(response.data, '', 'error')
      }
    })
  }


  return (
    <Modal show={visibility} onHide={show} centered>
      <ModalHeader closeButton>
        <ModalTitle>Agregar nuevo lugar de trabajo</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Col>
          <GoogleMap mapContainerStyle={{ width: '100%', height: '50vh' }} zoom={!geo ? 4 : 15} center={!geo ? defaultCenter : geo} onClick={(e) => newPoint(e)}>
            {placeList && placeList.workplaces.map(workplace => {
                return (
                  <><MarkerF position={{lat: workplace.lat, lng: workplace.lng}} icon={pointer} /></>
                )
              })}
            <MarkerF position={geo} />
          </GoogleMap>
        </Col>
        <Col>
          <Form onSubmit={submitForm}>
            <Stack gap={3}>
              <Form.Group>
                <Form.Control type="text" name='position' value={!geo ? 'Seleccione un lugar en el mapa' : `${geo.lat},${geo.lng}`} readOnly />
              </Form.Group>
              <Form.Group>
                <Form.Label htmlFor='place'>Ingrese el nombre del lugar:</Form.Label>
                <Form.Control type='text' onChange={handleInputChange} name='place' placeholder='Ej: Banco Municipal' required />
              </Form.Group>
              <Form.Group>
                <Form.Label htmlFor='reference'>Indique la esquina de referencia:</Form.Label>
                <Form.Control type='text' onChange={handleInputChange} name='reference' placeholder='Ej: Jujuy y Dorrego' required />
              </Form.Group>
              <Form.Group>
                <Form.Label htmlFor='city'>Indique la ciudad:</Form.Label>
                <Form.Control type='text' onChange={handleInputChange} name='city' placeholder='Ej: Santa Fé' required />
              </Form.Group>
              <Form.Group className='d-flex justify-content-around'>
                <Button type='button' variant='secondary' onClick={() => show()}>Cancelar</Button>
                <Button type='submit' variant='primary'>Agregar</Button>
              </Form.Group>
            </Stack>
          </Form>
        </Col>
      </ModalBody>
    </Modal>
  );
}

export default NewPlace;