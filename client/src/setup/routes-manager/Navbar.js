import React from "react";
import { Link } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';
import logo from '../../assets/brand/Logo-celeste.png'

const color = {textDecoration: 'none', color: 'white'}

export default function NavbarTL() {
  return (
    <>
      <Navbar expand='md' sticky="top" bg="primary" variant="dark">
      <Navbar.Toggle aria-controls="navbarScroll" />
      <Navbar.Brand>
        <img
            src={logo}
            width="120"
            height="30"
            style={{marginLeft:20}}
            alt="Repo logo"
          />
        </Navbar.Brand>
        <Navbar.Collapse id="navbarScroll" className="justify-content-end" style={{marginRight:50}}>
          <Nav>
            <Nav.Link><Link to="/tl/report" style={color}>Reporte</Link></Nav.Link>
            <Nav.Link><Link to="/tl/myteam" style={color}>Mi equipo</Link></Nav.Link>
            <Nav.Link><Link to="/tl/workplaces" style={color}>Lugares</Link></Nav.Link>
            <Nav.Link><Link to="/tl/planning" style={color}>Planning</Link></Nav.Link>
            <Nav.Link><Link to="/tl/myschedule" style={color}>Cronograma</Link></Nav.Link>
            <Nav.Link><Link to="/tl" style={color}>Mi cuenta</Link></Nav.Link>
            <Nav.Link onClick={() => localStorage.removeItem('data')}><Link to="/" style={color}>Cerrar sesión</Link></Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  )
}


export function NavbarFacer() {
  return (
    <>
      <Navbar expand='md' sticky="top" bg="primary" variant="dark">
      <Navbar.Toggle aria-controls="navbarScroll" />
      <Navbar.Brand>
        <img
            src={logo}
            width="120"
            height="30"
            style={{marginLeft:20}}
            alt="Repo logo"
          />
        </Navbar.Brand>
        <Navbar.Collapse id="navbarScroll" className="justify-content-end" style={{marginRight:50}}>
          <Nav>
            <Nav.Link><Link to="/facer/report" style={color}>Reporte</Link></Nav.Link>
            <Nav.Link><Link to="/facer/myschedule" style={color}>Mi cronograma</Link></Nav.Link>
            <Nav.Link><Link to="/facer" style={color}>Mi cuenta</Link></Nav.Link>
            <Nav.Link onClick={() => localStorage.removeItem('data')}><Link to="/" style={color}>Cerrar sesión</Link></Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  )
}

export function NavbarRRHH() {
  return (
    <>
      <Navbar expand='md' sticky="top" bg="primary" variant="dark">
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Brand>
        <img
            src={logo}
            width="120"
            height="30"
            style={{marginLeft:20}}
            alt="Repo logo"
          />
        </Navbar.Brand>
        <Navbar.Collapse id="navbarScroll" className="justify-content-end" style={{marginRight:50}}>
          <Nav>
            <Nav.Link><Link to="/rrhh/users" style={color}>Usuarios</Link></Nav.Link>
            <Nav.Link><Link to="/rrhh" style={color}>Mi cuenta</Link></Nav.Link>
            <Nav.Link onClick={() => localStorage.removeItem('data')}><Link to="/" style={color}>Cerrar sesión</Link></Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  )
}