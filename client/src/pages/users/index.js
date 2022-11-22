import React, { useState, useEffect, useContext } from 'react';
import NewUser from './components/NewUser';
import EditUser from './components/EditUser';
import EditBoss from './components/EditBoss';
import Reports from './components/Reports';
import useAuth from '../../setup/Hooks/useAuth';
import axios from '../../setup/Hooks/axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Button, Tooltip, Form, Container, Row, Col, ListGroup, Spinner, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ReactTooltip from 'react-tooltip';


function Users() {
  const MySwal = withReactContent(Swal)
  const { auth } = useAuth()
  const LOGIN_URL = '/users'
  const [users, setUsers] = useState();
  const [refresh, setRefresh] = useState(0);
  const [str, setStr] = useState('');
  const [data, setData] = useState();
  const [showAdd, setShowAdd] = useState(false)
  const [user, setUser] = useState()
  const [viewReport, setViewReport] = useState()

  const showAddForm = () => {
    showAdd === true ? setShowAdd(false) : setShowAdd(true)
  }

  const deleteUser = async (e) => {
    MySwal.fire({
      icon: 'warning',
      title: 'Estás segur@ de eliminar este usuario?',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await axios.delete(`${LOGIN_URL}?id=${e.target.id.slice(1)}`,
          {
            headers: {
              'content-type': 'application/json',
              'auth-token': auth.token
            }
          })
        console.log(res);
        return res
      } else {
        return
      }
    }).then(response => {
      if (!response) return
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: response.data,
          confirmButtonText: 'OK',
        })
        return response.status
      } else {
        Swal.fire(response.data, '', 'error')
      }
    }).then(status => {
      if (status === 200) {
        refreshPage()
      }
    })
  }

  const resetPass = async (e) => {
    MySwal.fire({
      icon: 'warning',
      title: 'Estás segur@ que quieres blanquear la contraseña de este usuario?',
      showCancelButton: true,
      confirmButtonText: 'Si, blanquear',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await axios.post(`${LOGIN_URL}/pass?id=${e.target.id.slice(1)}`,
          JSON.stringify({}),
          {
            headers: {
              'content-type': 'application/json',
              'auth-token': auth.token
            }
          })
        console.log(res);
        return res
      } else {
        return
      }
    }).then(response => {
      if (!response) return
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: response.data,
          confirmButtonText: 'OK',
        })
        return response.status
      } else {
        Swal.fire(response.data, '', 'error')
      }
    })
  }

  const editUser = (e) => {
    setData(users.users.find(user => user.user_ID == e.target.id.slice(1)))
  }

  const editBoss = (e) => {
    setUser({id: e.target.id.slice(1), name: e.target.name, role: e.target.role})
  }
  
  const viewReports = (e) => {
    !e ? setViewReport() : setViewReport(e.target.id.slice(1))
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
    fetchData().then(result => setUsers(result))
  }, [refresh]);

  const searchText = (text) => {
    if (text.user_surname.toLowerCase().includes(str.toLowerCase()) || text.user_name.toLowerCase().includes(str.toLowerCase())) return text
  }

  const renderTooltip = (props) => (
    <Tooltip id="btn" {...props}>
      Texto prueba
    </Tooltip>
  )
  
  return (
    <section>
    <Container>
      <NewUser visibility={showAdd} show={showAddForm} reset={refreshPage} />
      {data && <EditUser userData={data} reset={setData} refreshState={refreshPage} />}
      {user && <EditBoss user={user} reset={setUser} refreshState={refreshPage} />}
      <Reports user={viewReport} reset={setViewReport} />
      <Col md={{ span: 6, offset: 3 }}>
        <Row>
          <Col className='d-flex justify-content-center'>
            <h2>Agregar un nuevo usuario:</h2>
            <Button type='button' onClick={showAddForm} size="sm" className='bi bi-person-plus-fill' />
          </Col>
        </Row>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">Usuario</InputGroup.Text>
          <Form.Control name='searcher' type='text' onChange={e => e.target.value == '' ? setStr('') : setStr(e.target.value)} />
        </InputGroup>
        {!users
          ? <Container className='d-flex justify-content-center align-items-center'><Spinner animation="border" variant="info" /></Container>
          : <ListGroup variant="flush">
              {users.users.filter(text => searchText(text)).map((user, i) => {
                return (
                  <ListGroup.Item>
                    <Row className='d-flex'>
                      <Col>
                        <div>{user.user_surname} {user.user_name}</div>
                      </Col>
                      <Col className='d-flex justify-content-end'>
                          {user.user_role < 30 && <Button data-tip='Asignar TL' data-for='btnBoss' name={`${user.user_surname} ${user.user_name}`} role={user.user_role} key={`kb${user.user_ID}`} id={`b${user.user_ID}`} onClick={editBoss} aria-hidden="true" variant="success" size="sm" className='bi bi-person-video2 text-white console' />}
                          <ReactTooltip id='btnBoss' type='error' className='custom-color-no-arrow' textColor='white' backgroundColor='#198754' effect="solid" />
                          <Button data-tip='Ver reportes' data-for='btnFlag' key={`kr${user.user_ID}`} id={`r${user.user_ID}`} type='button' onClick={viewReports} variant="primary" size="sm" className='bi bi-flag-fill text-white console' />
                          <ReactTooltip id='btnFlag' type='error' className='custom-color-no-arrow' textColor='white' backgroundColor='#0d6efd' effect="solid" />
                          <Button data-tip='Editar usuario' data-for='btnEdit' key={`ke${user.user_ID}`} id={`e${user.user_ID}`} onClick={editUser} variant="warning" size="sm" className='bi bi-pencil text-black console' />
                          <ReactTooltip id='btnEdit' type='error' className='custom-color-no-arrow' textColor='black' backgroundColor='#ffc107' effect="solid" />
                          <Button data-tip='Blanquear contraseña' data-for='btnRefresh' key={`kp${user.user_ID}`} id={`p${user.user_ID}`} onClick={resetPass} variant="dark" size="sm" className='bi bi-arrow-counterclockwise text-white console' />
                          <ReactTooltip id='btnRefresh' type='error' className='custom-color-no-arrow' textColor='white' backgroundColor='black' effect="solid" />
                          <Button data-tip='Eliminar usuario' data-for='btnDelete' key={`kd${user.user_ID}`} id={`d${user.user_ID}`} onClick={deleteUser} variant="danger" size="sm" className='bi bi-trash3-fill text-white console' />
                          <ReactTooltip id='btnDelete' type='error' className='custom-color-no-arrow' textColor='white' backgroundColor='#dc3545' effect="solid" />
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )
              })}
            </ListGroup>
        } 
      </Col>
      </Container>
    </section>
  );
}

export default Users;