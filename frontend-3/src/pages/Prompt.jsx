import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Prompt.css";
import Navbar from "../components/Navbar";
import SideNavigation from "../components/SideNavigation";
import { Jsme } from "jsme-react";
import axios from "axios";
import { MdContentCopy } from "react-icons/md";
import Login from "../components/Login";
import HomeSign from "./homesign.png";

export default function Prompt() {
  let navigate = useNavigate();

  return (
    <div class="fade-in">
      <div>
        <Navbar />
      </div>
      <div style={{ display: "flex", zoom: "80%" }}>
        <div>
          <Login />
        </div>
        <div class="borderpt">
          <span class="text"></span>
        </div>
        <div>
          <img src={HomeSign} alt="homeprompt" class="homesign" />
        </div>
      </div>
    </div>
  );
}
