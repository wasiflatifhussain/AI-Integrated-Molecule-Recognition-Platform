import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css";
import Navbar from '../components/Navbar';
import SideNavigation from '../components/SideNavigation';
import { Jsme } from 'jsme-react';
import axios from 'axios';
import {MdContentCopy} from 'react-icons/md';
import Login from '../components/Login';
import HomeSign from './homesign.png';



export default function Home() {
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

      return false;
    };
    const generateToken = (length) => {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const token = Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map((byte) => characters[byte % characters.length])
        .join("");
      return token;
    };

    const setCookie = (name, value, days) => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
      const cookieValue =
        encodeURIComponent(value) + "; expires=" + expiryDate.toUTCString();
      document.cookie = name + "=" + cookieValue + "; path=/";
    };

    useEffect(() => {
      // Usage:
      const tokenExists = checkTokenCookie();
      if (!tokenExists) {
        navigate("/prompt")
      } else {
        const randomToken = generateToken(30);
        setCookie("token", randomToken, 20);
        navigate("/predictions")
      }
    },[])
    
    const closePopup = () => {
      document.getElementById("popup2").style.display = "none";
    };
    
  return (
    <div class="fade-in">
      <div id="popup2" class="popup2">
        <div class="popup2-content">
          <span class="close2" onClick={closePopup}>
            &times;
          </span>
          <h2>Notice</h2>
          <p style={{ textAlign: "center", width: "400px" }}>
            This service is still under-development. <br />
            The page shall be updated after the completion of the features on
            this page.
          </p>
        </div>
      </div>
      <div>
        <Navbar />
      </div>
      <div style={{ display: "flex" }}>
        <SideNavigation />
        <div class="grid-container">
          <div class="item1">
            <div style={{ paddingBottom: "20px" }}></div>
          </div>
          <div id="item2">
            <div id="i2child1"></div>
            <div style={{ display: "flex" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
