import React, { useState, useEffect } from 'react';
import useAuth from '../../setup/Hooks/useAuth';
import axios from '../../setup/Hooks/axios';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Button, Form, Stack, Row, Col, Container } from 'react-bootstrap';

function MyAccount() {
  const MySwal = withReactContent(Swal)
  const { auth } = useAuth()
  const [data, setData] = useState();
  const [pass, setPass] = useState();
  const [refresh, setRefresh] = useState(0);
  const LOGIN_URL = '/myaccount'

  const handleInputChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    })
  }
  
  const handlePassChange = (e) => {
    setPass({
      ...pass,
      [e.target.name]: e.target.value
    })
  }

  const refreshPage = () => setRefresh(refresh === 1 ? 0 : 1)

  const fetchData = async () => {
    const res = await axios.get(LOGIN_URL,
    {
      headers: {
        'content-type': 'application/json',
        'auth-token': auth.token
      }
    })
    return res.data
  }

  useEffect(() => {
    fetchData().then(result => setData(
      {
        userName: result[0].user_name,
        userSurname: result[0].user_surname,
        email: result[0].email,
        phone: result[0].phone,
        city: result[0].user_city
      }
    ))
}, [refresh]);

  const submitPassForm = async (e) => {
    e.preventDefault()

    if(pass.password != pass.repassword) return MySwal.fire({
      title: 'Las contraseñas ingresadas no coinciden.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6'
    })

    MySwal.fire({
      title: 'Estás segur@ de cambiar tu contraseña?',
      showCancelButton: true,
      confirmButtonText: 'Si, cambiar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await axios.post(LOGIN_URL+'/pass',
          JSON.stringify({password: pass.password}),
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
        setPass()
        refreshPage()
      } else {
        Swal.fire(response.data, '', 'error')
      }
    })
  }

  const submitForm = async (e) => {
    e.preventDefault()

    MySwal.fire({
      title: 'Estás segur@ de realizar estos cambios?',
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
        refreshPage()
      } else {
        Swal.fire(response.data, '', 'error')
      }
    })
  }

  return ( 
    <Container fluid>
    <Row className='justify-content-md-center'>
      <Col md='4'>
        <Form onSubmit={submitForm}>
          <h2>Datos de mi cuenta</h2>
          {data && 
          <Stack gap={3}>
            <Form.Group>
              <Form.Label htmlFor='userName'>Nombre:</Form.Label>
              <Form.Control type='text' defaultValue={data.userName} onChange={handleInputChange} name='userName' disabled />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor='userSurname'>Apellido:</Form.Label>
              <Form.Control type='text' defaultValue={data.userSurname} onChange={handleInputChange} name='userSurname' disabled />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor='email'>Email:</Form.Label>
              <Form.Control type='email' defaultValue={data.email} onChange={handleInputChange} name='email' required />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor='city'>Ciudad:</Form.Label>
              <Form.Control type='text' defaultValue={data.city} onChange={handleInputChange} name='city' required />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor='phone'>Teléfono:</Form.Label>
              <Form.Control type='number' defaultValue={data.phone} onChange={handleInputChange} name='phone' maxLength='12' minLength='12' placeholder="(54+'sin 0'+'sin 15') ej: 543413457788" required />
            </Form.Group>
            <Form.Group className='d-flex justify-content-around'>
              <Button type='submit' variant='primary'>Continuar</Button>
            </Form.Group>
          </Stack>
          }
        </Form>
      </Col>
      <Col md='4'>
      <Form onSubmit={submitPassForm}>
          <h2>Cambiar contraseña:</h2>
          {data && 
          <Stack gap={3}>
            <Form.Group>
              <Form.Label htmlFor='password'>Ingrese su nueva contraseña:</Form.Label>
              <Form.Control type='password' onChange={handlePassChange} name='password' required />
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor='repassword'>Vuelva a ingresar su nueva contraseña:</Form.Label>
              <Form.Control type='password' onChange={handlePassChange} name='repassword' required />
            </Form.Group>
            <Form.Group className='d-flex justify-content-around'>
              <Button type='submit' variant='primary'>Continuar</Button>
            </Form.Group>
          </Stack>
          }
        </Form>
      </Col>
    </Row>
    </Container>
   );
}

export default MyAccount;