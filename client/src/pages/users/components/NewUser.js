import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import useAuth from '../../../setup/Hooks/useAuth';
import axios from '../../../setup/Hooks/axios';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Button, Form, Stack, Modal, ModalHeader, ModalBody, ModalTitle } from 'react-bootstrap';

function NewUser({ visibility, show, reset }) {
  const MySwal = withReactContent(Swal)
  const { auth } = useAuth()
  const [data, setData] = useState({});
  const [roles, setRoles] = useState({});
  const LOGIN_URL = '/users'

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
      fetchData().then(result => setRoles(result.roles.map(role => {
        return { value: role.role_ID, label: role.role_name }
      })))
  }, []);

  const submitForm = async (e) => {
    e.preventDefault()

    MySwal.fire({
      title: 'Estás segur@ de agregar este usuario?',
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
        show()
        reset()
      } else {
        Swal.fire(response.data, '', 'error')
      }
    })
  }

  return (
    <Modal show={visibility} onHide={show}>
      <ModalHeader closeButton>
        <ModalTitle>Crear nuevo usuario</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={submitForm}>
        <Stack gap={3}>
          <Form.Group>
            <Form.Label htmlFor='userName'>Nombre:</Form.Label>
            <Form.Control type='text' onChange={handleInputChange} name='userName' required />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='userSurname'>Apellido:</Form.Label>
            <Form.Control type='text' onChange={handleInputChange} name='userSurname' required />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='dni'>DNI:</Form.Label>
            <Form.Control type='number' onChange={handleInputChange} name='dni' placeholder='(sin puntos)' maxLength="8" minLength="7" required />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='email'>Email:</Form.Label>
            <Form.Control type='email' onChange={handleInputChange} name='email' required />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='city'>Ciudad:</Form.Label>
            <Form.Control type='text' onChange={handleInputChange} name='city' required />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='phone'>Teléfono:</Form.Label>
            <Form.Control type='number' onChange={handleInputChange} name='phone' maxLength='12' minLength='12' placeholder="(54+'sin 0'+'sin 15') ej: 543413457788" required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Seleccione el tipo de usuario:</Form.Label>
            {!roles ? <Select isLoading={true} /> : <Select name='role' onChange={role => setData({ ...data, role: role.value })} options={roles} isClearable={false} isSearchable={false} required />}
          </Form.Group>
          <Form.Group className='d-flex justify-content-around'>
            <Button type='button' variant='secondary' onClick={() => show()}>Cancelar</Button>
            <Button type='submit' variant='primary'>Agregar</Button>
          </Form.Group>
        </Stack>
        </Form>
      </ModalBody>
    </Modal>
  );
}

export default NewUser;




{/* <div>
      {!userData ? '' : <h2>{userData.user_ID} | {userData.user_name}</h2>}
      <form onSubmit={submitForm}>
        <label>Nombre:
          <input
            type='text'
            onChange={handleInputChange}
            name='userName'
            defaultValue={userData.user_name}
            value={data.userName}
            required />
        </label>
        <label>Apellido:
          <input
            onChange={handleInputChange}
            type='text'
            name='userSurname'
            defaultValue={userData.user_surname}
            value={data.userSurname}
            required />
        </label>
        <label>Email:
          <input
            onChange={handleInputChange}
            type='email'
            name='email'
            defaultValue={userData.email}
            value={data.email}
            required />
        </label>
        <label>Ciudad:
          <input
            onChange={handleInputChange}
            type='text'
            name='city'
            defaultValue={userData.city}
            value={data.city}
            required />
        </label>
        <label>Teléfono:
          <input
            type='text'
            onChange={handleInputChange}
            name='phone'
            defaultValue={userData.phone}
            value={data.phone}
            placeholder='(con 54, sin 0 y sin 15) ej: 543413457788'
            maxLength="12"
            minLength="12"
            required />
        </label>
        <label name='role'> Seleccione el tipo de usuario:
          {!roles ? <Select isLoading={true} /> : <Select name='role' className='' value={currentRole} onChange={role => { setCurrentRole(role); setData({ ...data, role: role.value }) }} options={roles} isClearable={false} isSearchable={false} required />}
        </label>
        <button key='cancelBtn' type='button' onClick={() => reset()}>Cancelar</button>
        <button key='submitBtn' type='submit'>Enviar</button>
      </form>
    </div> */}