import React, { useState } from 'react';
import TeamsList from './components/TeamsList';
import NewTeam from './components/NewTeam';
import { Button, Stack, Container, Row, Col } from 'react-bootstrap';


function Teams() {
  const [show, setShow] = useState(false)
  const [refresh, setRefresh] = useState(0)
  
  const showForm  = () => {
    setShow(show === true ? false : true)
  }

  const refreshPage = () => refresh === 1 ? setRefresh(0) : setRefresh(1)

  return ( 
    <section>
      <Container>
        <NewTeam visibility={show} show={showForm} reset={refreshPage} />
        <Stack gap={4}>
          <Row>
            <Col md={{ span: 8, offset: 2 }} className='d-flex justify-content-center'>
              <h2>Crear un nuevo equipo:</h2>
              <Button type='button' onClick={showForm} size="sm" className='bi bi-plus-lg text-white'/>
            </Col>
          </Row>
          <TeamsList refresh={refresh} reset={setRefresh} />
        </Stack>
      </Container>
    </section>
   );
}

export default Teams;