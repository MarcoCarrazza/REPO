import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Stack, Container, Row, Col } from 'react-bootstrap';
import useAuth from './setup/Hooks/useAuth';
import axios from './setup/Hooks/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROLES } from './setup/context/roles';

const LOGIN_URL = '/user/login'

function Login() {
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const userRef = useRef()
  const errRef = useRef()

  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    userRef.current.focus()
  }, []);

  useEffect(() => {
    setErrMsg('')
  }, [user, pwd]);

  useEffect(() => {
    if (window.localStorage.getItem('data')){
      const data = JSON.parse(window.localStorage.getItem('data'))
      console.log(data);
      function from(userRole) {
        if (userRole == ROLES.facer) return '/facer'
        if (userRole == ROLES.teamLeader) return '/tl'
        if (userRole == ROLES.rrhh) return '/rrhh'
        if (userRole == ROLES.admin) return '/rrhh'
      }
      navigate(from(data.c), { replace: true })
    }

  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post(LOGIN_URL,
        JSON.stringify({ dni: user, password: pwd }),
        {
          headers: {
            'content-type': 'application/json'
          }
        })

      const token = res.data.token
      const role = res.data.role
      const userID = res.data.userID

      setAuth({ userID, token, role })
      window.localStorage.setItem('data', JSON.stringify({ a: userID, b: token, c: role }))
      setUser('')
      setPwd('')

      function from(userRole) {
        if (userRole == ROLES.facer) return '/facer'
        if (userRole == ROLES.teamLeader) return '/tl'
        if (userRole == ROLES.rrhh) return '/rrhh'
        if (userRole == ROLES.admin) return '/rrhh'
      }
      navigate(from(role), { replace: true })

    } catch (err) {
      console.log(err);
      if (!err.response) {
        setErrMsg('Ninguna respuesta del servidor :( ')
      } else if (err.response.status === 400 || err.response.status === 401) {
        setErrMsg(err.response.data)
      } else {
        setErrMsg('Algo falló al intentar iniciar sesión.')
      }
      // await errMsg.current.focus()
    }
  }

  return (
    <section>
      <Container>
        <Row className='justify-content-md-center align-content-center' style={{marginTop: 100}}>
          <Col md='6'>
            <h1>Iniciar sesión</h1>
            <Form onSubmit={handleSubmit}>
              <Stack gap={2}>
                <Form.Group>
                  <Form.Label htmlFor='user'> Ingrese su DNI (sin puntos)</Form.Label>
                  <Form.Control minLength={7} maxLength={8} type='number' ref={userRef} autoComplete='on' onChange={e => setUser(e.target.value)} value={user} required />
                </Form.Group>
                <Form.Group>
                  <Form.Label type='password'> Ingrese su contraseña</Form.Label>
                  <Form.Control type='password' onChange={e => setPwd(e.target.value)} value={pwd} autoComplete='off' required />
                </Form.Group>
                <Form.Group>
                  {errMsg && <Form.Text>{errMsg}</Form.Text>}
                </Form.Group>
                <Button type="submit">Iniciar sesión</Button>
              </Stack>
            </Form>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default Login;