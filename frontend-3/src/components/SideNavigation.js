import { useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { FaCog, FaUserTie, FaColumns, FaThList } from "react-icons/fa";
import {
  Menu,
  MenuItem,
  ProSidebar,
  SidebarHeader,
  SubMenu
} from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import styled from "styled-components";
import "./SideNavigation.scss";
import { RiPagesLine,RiLogoutBoxRFill } from "react-icons/ri";
import { BsFillPersonBadgeFill, BsVectorPen } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";




const Menuitem = styled(MenuItem)`

  :hover {
    background-color: rgb(236, 136, 136);
    ${'' /* padding: 5px;
    border-radius: 10px; */}
  };

  
`;

const SideNavigation = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const styles = {
    sideBarHeight: {
      height: "200vh",
      borderRight: "0.5px red solid"
    },
    menuIcon: {
      float: "left",
      marginTop: "15px",
      marginBottom: "10px",
      marginLeft: "10px",
      paddingLeft: "5px",
    },
    
  };
  const onClickMenuIcon = () => {
    setCollapsed(!collapsed);
  };
  const removeTokenCookie = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };
  const logout = () => {
    
    removeTokenCookie();
    navigate("/prompt")
  }
  return (
    <div
      style={{
        padding: "0px",
        margin: "0px",
        display: "inline-block",
        width: "12%",
        zoom: "80%",
      }}
    >
      {/* <Navbar /> */}

      <ProSidebar style={styles.sideBarHeight} collapsed={collapsed}>
        <SidebarHeader>
          <div style={styles.menuIcon} onClick={onClickMenuIcon}>
            <AiOutlineMenu />
          </div>
        </SidebarHeader>
        <Menu iconShape="square" className="sideMain">
          <Menuitem icon={<FaColumns color="white" />}>
            <Link to="/">Home</Link>
          </Menuitem>
          <Menuitem icon={<RiPagesLine color="white" />}>
            <Link to="/structures">
              Structure <br></br>Generation
            </Link>
          </Menuitem>
          <Menuitem icon={<FaUserTie color="white" />}>
            <Link to="/predictions">
              Property <br></br>Prediction
            </Link>
          </Menuitem>
          <Menuitem icon={<BsFillPersonBadgeFill color="white" />}>
            <Link to="/teaminfo">Team Info</Link>
          </Menuitem>
        </Menu>

        <Menu iconShape="square" className="sideSide">
          <Menuitem icon={<RiLogoutBoxRFill color="white" />} onClick={logout}>
            Logout
          </Menuitem>
        </Menu>
      </ProSidebar>
    </div>
  );
};
export default SideNavigation;
