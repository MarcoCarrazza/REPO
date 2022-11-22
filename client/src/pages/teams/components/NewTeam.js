import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import useAuth from '../../../setup/Hooks/useAuth';
import axios from '../../../setup/Hooks/axios';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Button, Form, Stack, Row, Col, Modal, ModalHeader, ModalBody, ModalTitle } from 'react-bootstrap';

function NewTeam({ visibility, show, reset }) {
  const MySwal = withReactContent(Swal)
  const [name, setName] = useState();
  const [date, setDate] = useState();
  const [places, setPlaces] = useState();
  const [persons, setPersons] = useState();
  const [placesSelected, setPlacesSelected] = useState([]);
  const [personsSelected, setPersonsSelected] = useState([]);
  const [objetives, setObjetives] = useState({});
  const { auth } = useAuth()
  const LOGIN_URL = '/teams'
  const LOGIN_URL2 = '/teamplace'

  const fetchData = async () => {
    const res = await axios.get(LOGIN_URL2,
      {
        headers: {
          'content-type': 'application/json',
          'auth-token': auth.token
        }
      })
    return res.data
  }

  useEffect(() => {
    fetchData().then(result => {
      setPlaces(result.workplaces.map(place => {
        return { value: place.place_ID, label: `${place.city} | ${place.name} - ${place.reference}` }
      }))
      setPersons(result.members.map(person => {
        return { value: person.employee_ID, label: `${person.facer_name} ${person.facer_surname}` }
      }))
    })
  }, []);

  useEffect(() => {
    setPersonsSelected()
    setObjetives({})
  }, [visibility]);


  const submitForm = async (e) => {
    e.preventDefault()

    if (placesSelected.length === 0 || personsSelected.length === 0) return alert('Debe elegir al menos 1 lugar de trabajo y 1 miembro para el equipo.')

    MySwal.fire({
      title: 'Estás segur@ de crear este equipo?',
      showCancelButton: true,
      confirmButtonText: 'Si, crear',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = {}
        data.name = name
        data.date = date
        data.workplaces = placesSelected.map(place => place.value)
        data.members = personsSelected.map(person => {
          console.log(objetives);
          return { user_ID: person.value, objetive: objetives[person.value] }
        })
        data.worktime = { start: e.target['startTime'].value, end: e.target['endTime'].value }
        console.log(data);

        const res = await axios.post(LOGIN_URL,
          JSON.stringify(data),
          {
            headers: {
              'content-type': 'application/json',
              'auth-token': auth.token
            }
          })
        console.log(res.status, res.statusText);
        return res
      } else {
        return 0
      }
    }).then((response) => {
      if (response === 0) return
      if (response.status === 200) {
        Swal.fire(response.data, '', 'success')
        reset()
        show()
      } else {
        Swal.fire(response.data, '', 'error')
      }
    })

  }

  const teamName = (e) => {
    setName(e.target.value)
  }

  const setSelected = (type, items) => {
    console.log(items);
    if (type === 'wp') return setPlacesSelected(items)
    if (type === 'p') return setPersonsSelected(items)
  }

  const handleInputChange = (e) => {
    setObjetives({
      ...objetives,
      [e.target.id]: e.target.value
    })
  }

  useEffect(() => {
    if(!personsSelected) return
    console.log(personsSelected);
    let allObj = {...objetives}
    personsSelected.forEach(per => {if(!allObj[per.value]){allObj = {...allObj, [per.value]: ''}}})
    setObjetives(allObj)
  }, [personsSelected]);

  return (
    <Modal show={visibility} onHide={show} centered>
      <ModalHeader closeButton>
        <ModalTitle>Crear nuevo equipo de trabajo</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={submitForm}>
          <Stack gap={3}>
            <Form.Group>
              <Form.Label htmlFor='name'>Indique el nombre del equipo:</Form.Label>
              <Form.Control name='name' id='name' type='text' onChange={teamName} required />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor='date'>Seleccione la fecha de trabajo:</Form.Label>
              <Form.Control name='date' id='date' type='date' onChange={(e) => setDate(e.target.value)} required />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor='placesSelect'>Seleccione los lugares de trabajo:</Form.Label>
              {!places ? <Select isLoading={true} /> : <Select name='placesSelect' onChange={items => setSelected('wp', items)} isMulti options={places} isClearable={true} isSearchable={true} />}
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor='personSelect'>Seleccione los miembros del equipo:</Form.Label>
              {!persons ? <Select isLoading={true} /> : <Select name='personSelect' onChange={items => setSelected('p', items)} isMulti options={persons} isClearable={true} isSearchable={true} required />}
            </Form.Group>
            <Form.Group>
              <Stack gap={2}>
                {personsSelected && personsSelected.map(person => {
                  return (
                    <Form.Control as="textarea" id={person.value} defaultValue={objetives[person.value] && objetives[person.value]} onChange={handleInputChange} key={person.value} placeholder={`Objetivos de ${person.label}:`} />
                  )
                })}
              </Stack>
            </Form.Group>
            <Form.Group>
            <Form.Label>Indique el horario de trabajo:</Form.Label>
            <Row>
              <Col>
              <Form.Label htmlFor='startTime'>Desde:</Form.Label>
              <Form.Control type='time' name='startTime' required />            
              </Col>
              <Col>
              <Form.Label htmlFor='endTime'>Hasta:</Form.Label>
              <Form.Control type='time' name='endTime' required />            
              </Col>
            </Row>
            </Form.Group>
            <Form.Group className='d-flex justify-content-around'>
              <Button type='button' variant='secondary' onClick={() => show()}>Cancelar</Button>
              <Button type='submit' variant='primary'>Crear equipo</Button>
            </Form.Group>
          </Stack>
        </Form>
      </ModalBody>
    </Modal>
  );
}

export default NewTeam;