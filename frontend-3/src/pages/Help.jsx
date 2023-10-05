import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Help.css";
import Navbar from "../components/Navbar";
import SideNavigation from "../components/SideNavigation";
import { Jsme } from "jsme-react";
import axios from "axios";
import { MdContentCopy } from "react-icons/md";
import Login from "../components/Login";
import HomeSign from "./homesign.png";
import HelpSign from "./helpsign.png";
import Help2 from "./help2.png";

export default function Help() {
    let navigate = useNavigate();

    const checkTokenCookie = () => {
      const cookieString = document.cookie;
      const cookies = cookieString.split(";");

      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith("token=")) {
          const tokenValue = cookie.substring(6);
          if (tokenValue !== "") {
            return true;
          }
        }
      }
    }

    useEffect(() => {
      // Usage:
      const tokenExists = checkTokenCookie();
      if (!tokenExists) {
        navigate("/helpout");
      } 
    });


  return (
    <div class="fade-in">
      <div>
        <Navbar />
      </div>
      <div style={{ display: "flex" }}>
        <SideNavigation />
        <div class="grid-container" style={{zoom: "75%"}}>
          <div>
            <img src={HelpSign} alt="homeprompt" class="signhelp" />
          </div>
          <div class="xborder">
            <span class="text"></span>
          </div>
          <div>
            <img src={Help2} alt="home2" class="help2" />
          </div>
        </div>
      </div>
    </div>
  );
}
