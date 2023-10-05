import React from 'react';
import {Route, Routes, useLocation} from "react-router-dom";
import Home from './Home';
import Input from './Input';
import Prediction from './Prediction';
import Upload from './Upload';
import Structure from './Structure';
import Prompt from './Prompt';
import Help from "./Help";
import Helpout from "./Helpout";
import Team from './Team';

export default function Pages() {
    const location = useLocation();
    return (
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/predictions/input" element={<Input />} />
        <Route path="/predictions" element={<Prediction />} />
        <Route path="/predictions/upload" element={<Upload />} />
        <Route path="/structures" element={<Structure />} />
        <Route path="/prompt" element={<Prompt />} />
        <Route path="/help" element={<Help />} />
        <Route path="/helpout" element={<Helpout />} />
        <Route path="teaminfo" element={<Team />} />
      </Routes>
    );
}
