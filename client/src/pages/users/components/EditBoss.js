import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import useAuth from '../../../setup/Hooks/useAuth';
import axios from '../../../setup/Hooks/axios';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import userIcon from '../../../assets/images/user.png'
import { Button, Form, Stack, Modal, ModalHeader, ModalBody, ModalTitle } from 'react-bootstrap';

function EditBoss({ user, reset, refreshState }) {
  const MySwal = withReactContent(Swal)
  const { auth } = useAuth()
  const LOGIN_URL = '/users'
  const [bosses, setBosses] = useState();
  const [currentBoss, setCurrentBoss] = useState();
  const [facers, setFacers] = useState();
  const [currentFacer, setCurrentFacer] = useState();

  const fetchData = async () => {
    const res = await axios.get(`${LOGIN_URL}/boss?id=${user.id}`,
      {
        headers: {
          'content-type': 'application/json',
          'auth-token': auth.token
        }
      })
    console.log(res.data);
    return res.data
  }

  useEffect(() => {
    if (!user) return
    fetchData().then(result => {
      setCurrentBoss(result.currentBoss.map(bossUser => {
        return { value: bossUser.boss_ID, label: `${bossUser.user_surname} ${bossUser.user_name}` }
      }))
      setCurrentFacer(result.currentFacer.map(facerUser => {
        return { value: facerUser.employee_ID, label: `${facerUser.user_surname} ${facerUser.user_name}` }
      }))
      setBosses(result.bosses.map(bossUser => {
        return { value: bossUser.user_ID, label: `${bossUser.user_surname} ${bossUser.user_name}` }
      }))
      setFacers(result.facers.map(facerUser => {
        return { value: facerUser.user_ID, label: `${facerUser.user_surname} ${facerUser.user_name}` }
      }))
    })
  }, [user]);

  const submitForm = async (e) => {
    e.preventDefault()

    MySwal.fire({
      title: 'Estás segur@ de confirmar estos cambios?',
      showCancelButton: true,
      confirmButtonText: 'Si, continuar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = { 
          userID: Number(user.id),
          bosses: currentBoss.map(bossID => bossID.value),
          facers: currentFacer.map(employeeID => employeeID.value)
        }
        console.log(data);
        const res = await axios.post(`${LOGIN_URL}/user`,
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
        clean()
        refreshState()
      } else {
        Swal.fire(response.data, '', 'error')
      }
    })
  }

  const clean = () => {
    setCurrentBoss()
    setCurrentFacer()
    setBosses()
    setFacers()
    reset()
  }
  console.log("role: ", user.role);
  return (
    <Modal show={user && true} onHide={clean}>
      <ModalHeader closeButton>
        <ModalTitle>Seleccione los Team Leaders para este usuario</ModalTitle>
      </ModalHeader>
      <ModalBody>
      <Form onSubmit={submitForm}>
      <Stack gap={3}>
        <Form.Group>
          <Form.Label htmlFor='bossSelect'>Sus líderes:</Form.Label>  
          {!bosses || !currentBoss
            ? <Select isLoading={true} />
            : <Select
                isMulti
                name='bossSelect'
                options={bosses}
                value={currentBoss}
                onChange={boss => setCurrentBoss(boss)}
                isSearchable={true}
                isClearable={true}
              />}
        </Form.Group>
        <Form.Group className='d-flex align-items-center justify-content-center'>
          <img src={userIcon} width={100} height={100} alt="usuario" />
          <h2>{user && user.name}</h2>
        </Form.Group>
        {user.role == 20 && <Form.Group>
          <Form.Label htmlFor='facerSelect'>Sus colaboradores:</Form.Label>  
          {!facers || !currentFacer
            ? <Select isLoading={true} />
            : <Select
                isMulti
                name='facerSelect'
                options={facers}
                value={currentFacer}
                onChange={facer => setCurrentFacer(facer)}
                isSearchable={true}
                isClearable={true}
              />}
        </Form.Group>}
        <Form.Group className='d-flex justify-content-around'>
          <Button type='button' variant='secondary' onClick={() => clean()}>Cancelar</Button>
          <Button type='submit' variant='primary'>Guardar</Button>
        </Form.Group>
        </Stack>
      </Form>
      </ModalBody>
    </Modal>
  );
}

export default EditBoss;