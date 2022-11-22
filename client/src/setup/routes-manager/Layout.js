import React from 'react';
import { Outlet } from "react-router-dom";
import NavbarTL, { NavbarFacer, NavbarRRHH } from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <>
      <Outlet />
      <footer>
        <Footer />
      </footer>
    </>
  );
}


export function LayoutTeamLeader() {
  return (
    <>
      <header>
        <NavbarTL className='NavBar' />
      </header>
      <main className="App">
        <Outlet />
      </main>
    </>
  );
}

export function LayoutFacer() {
  return (
    <>
      <header>
        <NavbarFacer className='NavBar' />
      </header>
      <main className="App">
        <Outlet />
      </main>
    </>
  );
}

export function LayoutRRHH() {
  return (
    <>
      <header>
        <NavbarRRHH className='NavBar' />
      </header>
      <main className="App">
        <Outlet />
      </main>
    </>
  );
}