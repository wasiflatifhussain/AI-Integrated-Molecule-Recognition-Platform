import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Prediction.css";
import Navbar from '../components/Navbar';
import SideNavigation from '../components/SideNavigation';
import { Jsme } from 'jsme-react';
import axios from 'axios';
import {MdContentCopy} from 'react-icons/md';



export default function Prediction() {
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
        navigate("/prompt");
      } else {
        const randomToken = generateToken(30);
        setCookie("token", randomToken, 20);
        navigate("/predictions");
      }
    },[]);
    const [loading, setLoading] = React.useState(false);
    const [imageUrl, setImageUrl] = React.useState('');
    const [smiles, setSmiles] = React.useState('');
    const [textSmiles,settextSmiles] = React.useState('');
    const [textImageUrl, settextImageUrl] = React.useState('');
    const [resultData, setresultData] = React.useState('');
    const [imgresultData, setimgresultData] = React.useState('');
    


    const drawTrigger = () => {
      let path = "/predictions/input";
      navigate(path);
    }

    const uploadTrigger2 = () => {
      let path = "/predictions/upload";
      navigate(path);
    }



    
  return (
    <div class="fade-in">
      <div>
        <Navbar />
      </div>
      <div style={{ display: "flex" }}>
        <SideNavigation />
        <div class="grid-container" style={{ zoom: "75%" }}>
          <div class="item1">
            <div style={{ paddingBottom: "20px" }}>
              <h1>Property Prediction</h1>
            </div>
            <hr />
          </div>
          <div id="item2">
            <div id="i2child1">
              <h4>Step 1:</h4>
              To predict the properties of one molecule, please select{" "}
              <b>"Single Molecule"</b>. To predict the properties of a batch of
              molecules, please select <b>"Batch Molecules"</b>.
            </div>
            <div style={{ display: "flex" }}>
              <div class="eachBtn">
                <input
                  type="submit"
                  name="entry"
                  value="Single Molecule"
                  className="manual"
                  onClick={drawTrigger}
                />
              </div>
              <div class="eachBtn">
                <input
                  type="submit"
                  name="entry"
                  value="Batch Molecules"
                  className="manual"
                  onClick={uploadTrigger2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
