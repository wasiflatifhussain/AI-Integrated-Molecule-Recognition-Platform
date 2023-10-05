import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Helpout.css";
import Navbar from "../components/Navbar";
import SideNavigation from "../components/SideNavigation";
import { Jsme } from "jsme-react";
import axios from "axios";
import { MdContentCopy } from "react-icons/md";
import Login from "../components/Login";
import HelpSign from "./helpsign.png";
import LogSign from "./logprompt.png";

export default function Helpout() {
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
  };


  const changepage = () => {
    navigate("/prompt");
  };

  return (
    <div class="fade-in">
      <div>
        <Navbar />
      </div>
      <div style={{ display: "flex", zoom: "75%" }}>
        <div>
          <div>
            <img src={LogSign} alt="logsign" class="logsign" />
          </div>
          <div>
            <input
              type="submit"
              value="Login"
              class="redirect"
              onClick={changepage}
            />
          </div>
        </div>
        <div class="borderhp">
          <span class="text"></span>
        </div>
        <div>
          <img src={HelpSign} alt="homeprompt" class="helpsign" />
        </div>
      </div>
    </div>
  );
}
