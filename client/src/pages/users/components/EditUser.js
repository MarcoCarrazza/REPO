import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import useAuth from '../../../setup/Hooks/useAuth';
import axios from '../../../setup/Hooks/axios';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Button, Form, Stack, Modal, ModalHeader, ModalBody, ModalTitle } from 'react-bootstrap';

function EditUser({ userData, reset, refreshState }) {
  const MySwal = withReactContent(Swal)
  const { auth } = useAuth()
  const LOGIN_URL = '/users'
  const [data, setData] = useState({ userID: userData.user_ID, userName: userData.user_name, userSurname: userData.user_surname, email: userData.email, phone: userData.phone, city: userData.user_city, role: userData.user_role });
  const [roles, setRoles] = useState();
  const [currentRole, setCurrentRole] = useState({ value: '', label: '' });

  const handleInputChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    })
  }

  const fetchData = async () => {
    const res = await axios.get(LOGIN_URL + '/roles',
      {
        headers: {
          'content-type': 'application/json',
          'auth-token': auth.token
        }
      })
    console.log(res);
    return res.data
  }
  
  useEffect(() => {
      !roles && fetchData().then(result => setRoles(result.roles.map(role => {
        return { value: role.role_ID, label: role.role_name }
      })))
  }, []);
  
  useEffect(() => {
    if (!roles) return
    setCurrentRole(roles.find(role => role.value == userData.user_role))
    setData({ userID: userData.user_ID, userName: userData.user_name, userSurname: userData.user_surname, email: userData.email, phone: userData.phone, city: userData.user_city, role: userData.user_role });
  }, [userData, roles]);

  const submitForm = async (e) => {
    e.preventDefault()

    console.log(data);
    MySwal.fire({
      title: 'Estás segur@ de confirmar estos cambios?',
      showCancelButton: true,
      confirmButtonText: 'Si, continuar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await axios.put(LOGIN_URL,
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
        refreshState()
      } else {
        Swal.fire(response.data, '', 'error')
      }
    })
  }

  return (
    <Modal show={userData && true} onHide={reset}>
      <ModalHeader closeButton>
        <ModalTitle>Editar usuario</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={submitForm}>
        <Stack gap={3}>
          <Form.Group>
            <Form.Label htmlFor='userName'>Nombre:</Form.Label>
            <Form.Control type='text' onChange={handleInputChange} name='userName' defaultValue={userData.user_name} value={data.userName} required />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='userSurname'>Apellido:</Form.Label>
            <Form.Control type='text' onChange={handleInputChange} name='userSurname'  defaultValue={userData.user_surname} value={data.userSurname} required />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='email'>Email:</Form.Label>
            <Form.Control type='email' onChange={handleInputChange} name='email' defaultValue={userData.email} value={data.email} required />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='city'>Ciudad:</Form.Label>
            <Form.Control type='text' onChange={handleInputChange} name='city' defaultValue={userData.city} value={data.city} required />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='phone'>Teléfono:</Form.Label>
            <Form.Control type='number' onChange={handleInputChange} name='phone' maxLength='12' minLength='12' placeholder="(54+'sin 0'+'sin 15') ej: 543413457788" defaultValue={userData.phone} value={data.phone} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Seleccione el tipo de usuario:</Form.Label>
            {!roles ? <Select isLoading={true} /> : <Select name='role' value={currentRole} onChange={role => { setCurrentRole(role); setData({ ...data, role: role.value }) }} options={roles} isClearable={false} isSearchable={false} required />}
          </Form.Group>
          <Form.Group className='d-flex justify-content-around'>
            <Button type='button' variant='secondary' onClick={() => reset()}>Cancelar</Button>
            <Button type='submit' variant='primary'>Enviar</Button>
          </Form.Group>
        </Stack>
        </Form>
      </ModalBody>
    </Modal>
    
    
    
  );
}

export default EditUser;