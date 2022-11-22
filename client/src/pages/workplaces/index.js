import React, { useState, useEffect } from 'react';
import useAuth from '../../setup/Hooks/useAuth';
import axios from '../../setup/Hooks/axios';
import NewPlace from './components/NewPlace';
import pointer from '../../assets/images/pointerGPS.png'
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api'
import { Button,  Stack, InputGroup, Form, Container, Row, Col, ListGroup, Spinner } from 'react-bootstrap';
const dotenv = require('dotenv');

dotenv.config()

function Workplaces() {
  const [show, setShow] = useState(false);
  const [places, setPlaces] = useState()
  const [cities, setCities] = useState()
  const [cityName, setCityName] = useState()
  const [refresh, setRefresh] = useState(0)
  const { auth } = useAuth()
  const LOGIN_URL = '/workplaces'
  const [geo, setGeo] = useState();
  const [marker, setMarker] = useState();
  const [str, setStr] = useState('');
  const defaultCenter = {lat: -36.671134, lng: -65.415603}

  const { isLoaded, loadError } = useLoadScript({
    // googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS
    googleMapsApiKey: 'AIzaSyBcRynnCLwomUdOHcIzXyChpEYlAx4ON2c'
  })

  const fetchData = async () => {
    const res = await axios.get(LOGIN_URL,
      {
        headers: {
          'content-type': 'application/json',
          'auth-token': auth.token
        }
      })
      const citiesList = []
      res.data.workplaces.forEach(pos => {
      const latLng = pos.geolocation.split('|')
      pos.lat = Number(latLng[0])
      pos.lng = Number(latLng[1])
      if (!citiesList.includes(pos.city)) {
        citiesList.push(pos.city);
    }
    });
    setCities(citiesList)
    return res.data
  }

  useEffect(() => {
    fetchData().then(result => {
      setPlaces(result)
    })
  }, [refresh]);

  const showForm = () => setShow(!show)

  const refreshPage = () => refresh === 1 ? setRefresh(0) : setRefresh(1)

  const selectMarker = (workplace) => {
    setGeo({lat: workplace.lat, lng: workplace.lng})
    setMarker(workplace)
  }

  const searchText = (text) => {
    if (text.name.toLowerCase().includes(str.toLowerCase())) return text
  }

  return (
    <section>
      <Container>
        <NewPlace visibility={show} show={showForm} reset={refreshPage} placeList={places} />
        <Stack gap={4}>
          <Row className='justify-content-md-center'>
            <Col md={6} className='d-flex justify-content-center'>
              <h2>Cargar un nuevo lugar de trabajo:</h2>
              <Button type='button' onClick={showForm} size="sm" className='bi bi-plus-lg' />
            </Col>
          </Row>
          {!places
            ? <div className='d-flex justify-content-center'><Spinner animation="border" variant="info" /></div>
            : <Row className='justify-content-md-center'>
                <Col className='map-container' md={{ order: 'last' }}>
                  <Stack gap={4}>
                    <GoogleMap mapContainerStyle={{ width: '100%', height: '50vh' }} zoom={!geo ? 4 : 15} center={!geo ? defaultCenter : geo}>
                      {places.workplaces.map(workplace => {
                        return (
                          <><MarkerF position={{lat: workplace.lat, lng: workplace.lng}} icon={pointer} onClick={() => selectMarker(workplace)} /></>
                        )
                      })}
                    </GoogleMap>
                    {marker && (<h2>{marker.name} - {marker.reference}, {marker.city}.</h2>)}
                  </Stack>
                </Col>
                <Col md={7}>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1">Ciudad</InputGroup.Text>
                  <Form.Select aria-label="Default select example" onChange={e => setCityName(cities[e.target.value])}>
                    <option>Seleccione una ciudad</option>
                    {cities.map((cityName, i) => <option value={i}>{cityName}</option>)}
                  </Form.Select>
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1">Buscar</InputGroup.Text>
                  <Form.Control name='searcher' type='text' onChange={e => e.target.value == '' ? setStr('') : setStr(e.target.value)} />
                </InputGroup>
                  <ListGroup variant="flush">
                    {places.workplaces.filter(text => searchText(text)).filter(name => name.city == cityName).map((workplace, i) => {
                      return (
                          <ListGroup.Item key={i} className='d-flex justify-content-between'>
                            <div>{workplace.city} | {workplace.name} - {workplace.reference}.</div>
                            <Button key={`kr${workplace.place_ID}`} onClick={() => setGeo({lat: workplace.lat, lng: workplace.lng})} variant="primary" size="sm" className='bi bi-geo-alt text-white' />
                          </ListGroup.Item>
                      )
                    })}
                  </ListGroup>
                </Col>
              </Row>
          }
        </Stack>
      </Container>
    </section>
  );
}

export default Workplaces;