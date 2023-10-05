import React, { useEffect, useState } from "react";
import { BiMenuAltRight } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import {FaUserNinja, FaUserCircle} from 'react-icons/fa';
import { BsFillPersonBadgeFill, BsVectorPen } from "react-icons/bs";
import "./Navbar.css";
import mainLogo from "./Logo_of_the_TCL_Corporation.svg.png"

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (size.width > 768 && menuOpen) {
      setMenuOpen(false);
    }
  }, [size.width, menuOpen]);

  const menuToggleHandler = () => {
    setMenuOpen((p) => !p);
  };

  return (
    <header className="header">
      <div className="header__content">
        <Link to="/" className="header__content__logo">
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ margin: "0" }}>
              <img
                style={{
                  marginTop: "25px",
                  marginLeft: "0px",
                  marginRight: "20px",
                  marginBottom: "0",
                  width: "75px",
                  height: "40px",
                }}
                id="mainlogo"
                src={mainLogo}
                alt="mainlogo"
              />
            </span>
            <span style={{ fontSize: "35px", paddingTop: "10px" }}>
              TCL AI Lab
            </span>
            <span
              style={{
                fontWeight: "lighter",
                paddingTop: "10px",
                paddingLeft: "20px",
              }}
            >
              |
            </span>
            <span
              style={{
                fontWeight: "lighter",
                paddingTop: "10px",
                paddingLeft: "20px",
                fontSize: "24px",
              }}
            >
              Materials Discovery
            </span>
          </div>
        </Link>
        <nav
          className={`${"header__content__nav"} 
          ${menuOpen && size.width < 768 ? `${"isMenu"}` : ""} 
          }`}
        >
          <ul id="rightbar">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/help">Help</Link>
            </li>
            <li style={{ paddingLeft: "40px" }}>
              <FaUserCircle
                size={40}
                color="#ec0000"
                style={{ paddingTop: 10 }}
              />
            </li>
          </ul>
        </nav>
        <div className="header__content__toggle">
          {!menuOpen ? (
            <BiMenuAltRight onClick={menuToggleHandler} />
          ) : (
            <AiOutlineClose onClick={menuToggleHandler} />
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;