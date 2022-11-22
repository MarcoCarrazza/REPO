import './App.css';
import React from 'react';
import Login from './Login';
import Workplaces from './pages/workplaces';
import Teams from './pages/teams';
import MyTeam from './pages/myteam';
import Status from './pages/status';
import MySchedule from './pages/myschedule';
import Users from './pages/users';
import MyAccount from './pages/myaccount';
import Unauthorized from './pages/unauthorized';
import Layout, { LayoutTeamLeader, LayoutFacer, LayoutRRHH } from './setup/routes-manager/Layout'
import RequireAuth from './setup/context/RequireAuth';
import { Routes, Route } from 'react-router-dom'
import { ROLES } from './setup/context/roles';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Login />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* Rutas de acceso para los TEAM-LEADERS */}
        <Route element={<RequireAuth allowedRole={[ROLES.teamLeader, ROLES.admin]} />}>
          <Route path='tl' element={<LayoutTeamLeader />}>
            <Route index element={<MyAccount />} />
            <Route path="report" element={<Status />} />
            <Route path="workplaces" element={<Workplaces />} />
            <Route path="planning" element={<Teams />} />
            <Route path='myschedule' element={<MySchedule />} />
            <Route path='myteam' element={<MyTeam />} />
          </Route>
        </Route>

        {/* Rutas de acceso para los FACERS */}
        <Route element={<RequireAuth allowedRole={[ROLES.facer, ROLES.admin]} />}>
          <Route path='facer' element={<LayoutFacer />}>
            <Route index element={<MyAccount />} />
            <Route path='report' element={<Status />} />
            <Route path='myschedule' element={<MySchedule />} />
          </Route>
        </Route>

        {/* Rutas de acceso para los RRHH */}
        <Route element={<RequireAuth allowedRole={[ROLES.rrhh, ROLES.admin]} />}>
          <Route path='rrhh' element={<LayoutRRHH />}>
            <Route index element={<MyAccount />} />
            <Route path='users' element={<Users />} />
            {/* <Route path='users' element={<Users />} /> */}
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
