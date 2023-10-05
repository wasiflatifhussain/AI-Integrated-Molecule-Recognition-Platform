import React, { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const antd = window.antd;
const Login = () => {

    const backendURL = process.env.REACT_APP_BACKEND_IP;
    let navigate = useNavigate();

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
    const handleSubmit = (event) => {
        event.preventDefault();
        const username = event.target.elements.username.value;
        const password = event.target.elements.password.value;
        axios
          .get(`${backendURL}/auth`, {
            params: {
              username: encodeURIComponent(username),
              password: encodeURIComponent(password),
            },
          })
          .then((res) => {
            if (res.data === "accesspermit") {
              const randomToken = generateToken(30);
              setCookie("token", randomToken, 20);
              // setCookie("username",username,20);
              localStorage.setItem('username',username)
              let path = "/predictions/";
              navigate(path);
            } else if (res.data === "accessdenied") {
              console.log(res.data);
              document.getElementById("error").style.display = "block";
              document.getElementById("username").value = "";
              document.getElementById("password").value = "";
              setTimeout(() => {
                document.getElementById("error").style.display = "none";
              }, 1000);
            }
          })
          .catch((err) => {
            console.log(err);
          });
    }
    return (
      <div className="login-box">
        <h2 style={{ fontSize: "40px" }}>Login</h2>
        <span style={{ color: "#f54343", marginBottom: "20px", marginLeft: "80px", display: "none"}} id="error">
          Incorrect username or password
        </span>
        <form onSubmit={handleSubmit}>
          <div className="user-box">
            <input type="text" name="username" id="username" required />
            <label>Username</label>
          </div>
          <div className="user-box">
            <input type="password" name="password" id="password" required />
            <label>Password</label>
          </div>
          <button>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Submit
          </button>
        </form>
      </div>
    );
};


export default Login;
