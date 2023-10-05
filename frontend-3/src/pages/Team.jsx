import React, { useEffect } from 'react';
import "./Team.css";
import Navbar from '../components/Navbar';
import SideNavigation from '../components/SideNavigation';
import icon from "./img_avatar.png";
import { useNavigate } from 'react-router-dom';

export default function Team() {
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
        navigate("/teaminfo");
      }
    },[]);
  return (
    <div class="fade-in">
      <div>
        <Navbar />
      </div>
      <div style={{ display: "flex" }}>
        <SideNavigation />
        <div class="grid-container">
          <div class="item1">
            <div style={{ paddingBottom: "0px" }}>
              <h1>Team Information</h1>
            </div>
            <hr />
          </div>
          <div class="teamWrapper">
            <div class="containerxxx">
              <div class="teamGrid">
                <div class="colmun">
                  <div class="teamcol">
                    <div class="teamcolinner">
                      <div class="avatar">
                        <img src={icon} alt="Member" />
                      </div>
                      <div class="member-name">
                        {" "}
                        <h2 align="center">William Xu</h2>{" "}
                      </div>
                      <div class="member-info">
                        <p align="center">Research Scientist</p>
                      </div>
                      <div class="member-mail">
                        {" "}
                        <p align="center">
                          {" "}
                          <a href="mailto:williamxu@tcl.com">
                            williamxu@tcl.com
                          </a>{" "}
                        </p>{" "}
                      </div>
                      <div class="member-social">
                        <p
                          style={{
                            paddingTop: "10px",
                            paddingBottom: "20px",
                            textAlign: "center",
                          }}
                        >
                          TCL AI Lab
                        </p>
                        <ul class="social-listing" style={{ display: "none" }}>
                          <li>
                            <a href="#">
                              <i class="fa fa-facebook"></i>
                            </a>
                          </li>
                          <li>
                            <a href="#">
                              <i class="fa fa-instagram"></i>
                            </a>
                          </li>
                          <li>
                            <a href="#">
                              <i class="fa fa-twitter"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="colmun">
                  <div class="teamcol">
                    <div class="teamcolinner">
                      <div class="avatar">
                        <img src={icon} alt="Member" />
                      </div>
                      <div class="member-name">
                        {" "}
                        <h2 align="center">John Chen</h2>{" "}
                      </div>
                      <div class="member-info">
                        <p align="center">Research Scientist</p>
                      </div>
                      <div class="member-mail">
                        {" "}
                        <p align="center">
                          {" "}
                          <a href="mailto:chenhan16@tcl.com">
                            chenhan16@tcl.com
                          </a>{" "}
                        </p>{" "}
                      </div>
                      <div class="member-social">
                        <p
                          style={{
                            paddingTop: "10px",
                            paddingBottom: "20px",
                            textAlign: "center",
                          }}
                        >
                          TCL AI Lab
                        </p>
                        <ul class="social-listing" style={{ display: "none" }}>
                          <li>
                            <a href="#">
                              <i class="fa fa-facebook"></i>
                            </a>
                          </li>
                          <li>
                            <a href="#">
                              <i class="fa fa-instagram"></i>
                            </a>
                          </li>
                          <li>
                            <a href="#">
                              <i class="fa fa-twitter"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="colmun">
                  <div class="teamcol">
                    <div class="teamcolinner">
                      <div class="avatar">
                        <img src={icon} alt="Member" />
                      </div>
                      <div class="member-name">
                        {" "}
                        <h2 align="center">HUSSAIN Wasif</h2>{" "}
                      </div>
                      <div class="member-info">
                        <p align="center">Research Intern</p>
                      </div>
                      <div class="member-mail">
                        {" "}
                        <p align="center">
                          {" "}
                          <a href="mailto:wasiflh@connect.hku.hk">
                            wasiflh@connect.hku.hk
                          </a>{" "}
                        </p>{" "}
                      </div>
                      <div class="member-social">
                        <p
                          style={{
                            paddingTop: "10px",
                            paddingBottom: "20px",
                            textAlign: "center",
                          }}
                        >
                          TCL AI Lab | HKU
                        </p>
                        <ul class="social-listing" style={{ display: "none" }}>
                          <li>
                            <a href="#">
                              <i class="fa fa-facebook"></i>
                            </a>
                          </li>
                          <li>
                            <a href="#">
                              <i class="fa fa-instagram"></i>
                            </a>
                          </li>
                          <li>
                            <a href="#">
                              <i class="fa fa-twitter"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
