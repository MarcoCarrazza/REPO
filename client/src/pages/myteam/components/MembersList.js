import React, { useState, useEffect } from 'react';
import useAuth from '../../../setup/Hooks/useAuth';
import axios from '../../../setup/Hooks/axios';
import { Container, Row, Col, ListGroup, Badge, Spinner, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


function MembersList() {
  const [members, setMembers] = useState();
  const { auth } = useAuth()
  const LOGIN_URL = '/myteam'

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
    fetchData().then(result => setMembers(result))
  }, []);

  return (
    <section>
      <Container>
        <Row>
          <Col md={{ span: 6, offset: 3 }}>
            <ListGroup variant="flush">
              {!members ? <div className='d-flex justify-content-center'><Spinner animation="border" variant="info" /></div> : members.members.map(person => {
                return (
                  <>
                    <ListGroup.Item className='d-flex justify-content-between' key={person.employee_ID}>
                      <div>{person.facer_surname} {person.facer_name}</div>
                      <Button target={"_blank"} href={`https://wa.me/${person.phone}?text=Hola ${person.facer_name}, `} className='bi bi-whatsapp' variant='success' />
                    </ListGroup.Item>
                  </>
                )
              })}     
            </ListGroup>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default MembersList;