import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Input.css";
import Navbar from '../components/Navbar';
import SideNavigation from '../components/SideNavigation';
import { Jsme } from 'jsme-react';
import axios from 'axios';
import {MdContentCopy} from 'react-icons/md';
import $ from 'jquery';
import jQuery from 'jquery';
import My3DViewer from './My3DViewer';
import ReactDOM from 'react-dom';
import Popup3DViewer from './Popup3DViewer';
import Ipynb1 from './Py3DmolViewer';


export default function Input() {
    const $3Dmol = require('3dmol');
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
    const [loading, setLoading] = React.useState(false);
    const [imageUrl, setImageUrl] = React.useState([]);
    const [smiles, setSmiles] = React.useState('');
    const [textSmiles,settextSmiles] = React.useState('');
    const [textImageUrl, settextImageUrl] = React.useState('');
    const [resultData, setresultData] = React.useState('');
    const [imgresultData, setimgresultData] = React.useState([]);
    const [mainImage,setmainImage] = React.useState('');
    const [threeDAppear, set3dAppear] = React.useState(false);
    const [popupOpen, setPopupOpen] = useState(false);

    useEffect(() => {
      // Usage:
      const tokenExists = checkTokenCookie();
      if (!tokenExists) {
        navigate("/prompt");
      } else {
        const randomToken = generateToken(30);
        setCookie("token", randomToken, 20);
        navigate("/predictions/input");
      }
    }, []);


    const closePopup = () => {
      document.getElementById("popup").style.display = "none";
    }

    const drawTrigger = () => {
      let path = "/predictions/input";
      navigate(path);
    }

    const uploadTrigger = () => {
      let path = "/predictions/upload";
      navigate(path);
    }

    const logSmiles = (smile) => {
        setSmiles(smile);
    };

    const generateRDKit = () => {
        const backendURL = process.env.REACT_APP_BACKEND_IP;
        axios
          .get(`${backendURL}/getImage`, {
            params: {
              smiles: `${smiles}`,
            },
          })
          .then((res) => {
            const dataUrl = `data:image/png;base64,${res.data.image}`;
            const dataUrl2 = `data:image/png;base64,${res.data.image2}`;
            // console.log(dataUrl);
            //console.log(dataUrl2);
            setImageUrl((prevArr) => [dataUrl, ...prevArr]);
            setmainImage(dataUrl2);
            console.log("Success");
            // console.log(imageUrl)
          })
          .catch((err) => {
            console.log(err);
          });     
    }

    const imageAICaller = async () =>  {
      // console.log(smiles);
      console.log(document.getElementById("modeldropdown22").value)
      const model = document.getElementById("modeldropdown22").value;
      if (model === "model1") {
        const backendURL = process.env.REACT_APP_BACKEND_IP;
        console.log(backendURL)
          
        const elem = document.createElement('p');
        elem.textContent = "Predicting latest results. Please wait....";
        elem.style.color = "#f54343";
        elem.style.marginTop = "0px";
        elem.style.marginLeft = "13px";
        elem.style.marginBottom = "5px";
        elem.style.fontSize = "19px";
        document.getElementById('checkpointhere').prepend(elem);
          
        axios
          .get(`${backendURL}/getResult`, {
            params: {
              smiles: smiles,
            },
          })
          .then((res) => {
              
            const parentElement = document.getElementById('checkpointhere');
            const elem = parentElement.querySelector('p'); // Assuming 'p' is the element tag you want to remove
            parentElement.removeChild(elem);
              
            if (res.data === "Please send a non-empty smiles.") {
              document.getElementById("errBox").style.display = "block";
              setimgresultData([]);
            } else {
              document.getElementById("errBox").style.display = "none";
              let tempArr = res.data;
              tempArr.push(false);
              tempArr.push("m1");
              if (tempArr[0] > -3.0 || tempArr[0] < -7.0) {
                tempArr[4] = true;
              } else if (tempArr[1] > 0 || tempArr[1] < -3.0) {
                tempArr[4] = true;
              } else if (tempArr[2] > 4 || tempArr[2] < 0) {
                tempArr[4] = true;
              } else if (tempArr[3] > 4 || tempArr[3] < 0) {
                tempArr[4] = true;
              }
              if (tempArr[4] === false) {
                generateRDKit();
                setimgresultData((prevArr) => [res.data, ...prevArr]);
                console.log(imgresultData);
              } else {
                document.getElementById("popup").style.display = "block";
              }
            }
          });
      } else if (model === "model2") {
        const backendURL = process.env.REACT_APP_BACKEND_IP3;
        console.log(backendURL)
        const username = localStorage.getItem('username');
          
        const elem = document.createElement('p');
        elem.textContent = "Predicting latest results. Please wait....";
        elem.style.color = "#f54343";
        elem.style.marginTop = "0px";
        elem.style.marginLeft = "13px";
        elem.style.marginBottom = "5px";
        elem.style.fontSize = "19px";
        document.getElementById('checkpointhere').prepend(elem);
          
        axios
          .get(`${backendURL}/getResult3`, {
            params: {
              smiles: smiles,
              username: username,
            },
          })
          .then((res) => {
              
            const parentElement = document.getElementById('checkpointhere');
            const elem = parentElement.querySelector('p'); // Assuming 'p' is the element tag you want to remove
            parentElement.removeChild(elem);
              
            if (res.data === "Please send a non-empty smiles.") {
              document.getElementById("errBox").style.display = "block";
              setimgresultData([]);
            } else {
              document.getElementById("errBox").style.display = "none";
                
              let tempArr2 = res.data;
              console.log(tempArr2)
                
              const values = tempArr2.split(',');
                
              let tempArr = []
                // Extract decimal values from each string and append to tempArr2
                values.forEach((value) => {
                  const decimalValue = parseFloat(value.split(':')[1]);
                  tempArr.push(decimalValue);
                });
                
              console.log(tempArr);
              tempArr.push(false);
              tempArr.push("m2");
                
              if (tempArr[0] > -3 || tempArr[0] < -8.0) {
                tempArr[4] = true;
              } else if (tempArr[1] > 0 || tempArr[1] < -4.0) {
                tempArr[4] = true;
              } else if (tempArr[2] > 7 || tempArr[2] < 0) {
                tempArr[4] = true;
              } else if (tempArr[3] > 7 || tempArr[3] < 0) {
                tempArr[4] = true;
              }
              if (tempArr[4] === false) {
                generateRDKit();
                setimgresultData((prevArr) => [tempArr, ...prevArr]);
                console.log(imgresultData);
              } else {
                document.getElementById("popup").style.display = "block";
              }
            }
          });
      } else if (model === "model3") {
          
        const elem = document.createElement('p');
        elem.textContent = "Predicting latest results. Please wait....";
        elem.style.color = "#f54343";
        elem.style.marginTop = "0px";
        elem.style.marginLeft = "13px";
        elem.style.marginBottom = "5px";
        elem.style.fontSize = "19px";
        document.getElementById('checkpointhere').prepend(elem);
          
        const backendURL = process.env.REACT_APP_BACKEND_IP3;
        const username = localStorage.getItem('username');
        axios
          .get(`${backendURL}/getResult4`, {
            params: {
              smiles: smiles,
              username: username,
            },
          })
          .then((res) => {
              
            const parentElement = document.getElementById('checkpointhere');
            const elem = parentElement.querySelector('p'); // Assuming 'p' is the element tag you want to remove
            parentElement.removeChild(elem);
              
            if (res.data === "Please send a non-empty smiles.") {
              document.getElementById("errBox").style.display = "block";
              setimgresultData([]);
            } else {
              document.getElementById("errBox").style.display = "none";
                
              let tempArr2 = res.data;
              console.log(tempArr2)
                
              const values = tempArr2.split(',');
                
              let tempArr = []
                // Extract decimal values from each string and append to tempArr2
                values.forEach((value) => {
                  const decimalValue = parseFloat(value.split(':')[1]);
                  tempArr.push(decimalValue);
                });
                
              console.log(tempArr);
              tempArr.push(false);
              tempArr.push("m3");
                
              if (tempArr[0] > 0.0 || tempArr[0] < -7.0) {
                tempArr[4] = true;
              } else if (tempArr[1] > 0 || tempArr[1] < -7.0) {
                tempArr[4] = true;
              } else if (tempArr[2] > 6 || tempArr[2] < 0) {
                tempArr[4] = true;
              } else if (tempArr[3] > 6 || tempArr[3] < 0) {
                tempArr[4] = true;
              }
              if (tempArr[4] === false) {
                generateRDKit();
                setimgresultData((prevArr) => [tempArr, ...prevArr]);
                console.log(imgresultData);
              } else {
                document.getElementById("popup").style.display = "block";
              }
            }
          });
      }
      

    }

    const closePopup2 = () => {
      // Close the popup
      setPopupOpen(false);
    };

    const copyToClipboard2 = () => {
      const copyText = document.getElementById("smileintake2")?.value || "";
      
      // Attempt to use the writeText() method
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText)
          .then(() => {
            // Success: Show copy confirmation message
            document.getElementById("copyspan").style.display = "inline-block";
            setTimeout(() => {
              document.getElementById("copyspan").style.display = "none";
            }, 3000);
          })
          .catch((error) => {
            // Error: Fallback to execCommand('copy')
            fallbackCopyToClipboard(copyText);
          });
      } else {
        // Fallback: execCommand('copy')
        fallbackCopyToClipboard(copyText);
      }
    };
    
    const fallbackCopyToClipboard = (text) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand("copy");
        // Success: Show copy confirmation message
        document.getElementById("copyspan").style.display = "inline-block";
        setTimeout(() => {
          document.getElementById("copyspan").style.display = "none";
        }, 3000);
      } catch (error) {
        // Error: Unable to copy
        console.error("Unable to copy to clipboard:", error);
      }
      
      document.body.removeChild(textArea);
    };
    

    const handleChange = (e) => {
      const { value } = e.target;
      // console.log(value);
      setSmiles(value);
    };

    const make3dAppear = () => {
      if (localStorage.getItem('username') === "wasif") {
        set3dAppear(true);
        document.getElementById("show3d").style.display = "block";
      }   
    }

    const htmlcode = `
      <!DOCTYPE html>
      <html>

      <head>
          <meta charset="utf-8">
          <title>JSmol -- Jmol/HTML5 Demo</title>
          <script type="text/javascript" src="./jsmol/JSmol.min.js"></script>
          <script type="text/javascript" src="./jsmol/JSmol.GLmol.min.js"></script>

          <script type="text/javascript">

              var jmolApplet0; // set up in HTML table, below

              var use = "HTML5" // JAVA HTML5 WEBGL IMAGE  are all otions
              var s = document.location.search;

              Jmol._debugCode = (s.indexOf("debugcode") >= 0);

              jmol_isReady = function (applet) {
                  document.title = (applet._id + " - Jmol " + Jmol.___JmolVersion)
                  Jmol._getElement(applet, "appletdiv").style.border = "1px solid blue"
              }

              var Info = {
                  width: 300,
                  height: 300,
                  debug: false,
                  color: "0xFFFFFF",
                  serverURL: "https://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
                  use: "WEBGL HTML5",
                  j2sPath: "./jsmol/j2s",
                  readyFunction: jmol_isReady,
                  script: "set antialiasDisplay;load data/caffeine.mol",
                  disableJ2SLoadMonitor: true,
                  disableInitialConsole: true,
                  allowJavaScript: true
              }
              $(document).ready(function () {
                  $("#appdiv").html(Jmol.getAppletHtml("jmolApplet0", Info))
              })
              var lastPrompt = 0;
          </script>
      </head>
      <script type="text/javascript">
          function onSubmitButtonClicked() {
              var varvar = document.getElementById("golden").value;
              var link = document.createElement("a");
              link.href = \`javascript:Jmol.script(jmolApplet0, 'load 1aho.pdb')\`;
              link.innerHTML = "reading";
              link.click();
          }
      </script>
      <body>
          <table cellpadding=10>
              <tr>
                  <td valign="top">
                      <div id="appdiv"></div>
                      <br>
                  </td>
                  <td valign=top>
                      <table cellpadding=5>
                          <tr>
                              <td valign=top id="linkContainer">
                                  <input type="text" id="golden">
                                  <input type="submit" value="Submit" onclick=\`onSubmitButtonClicked()\`>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>

      </html>
    `
    





    
  return (
    <div>
      <div id="popup" class="popup">
        <div class="popup-content">
          <span class="close" onClick={closePopup}>
            &times;
          </span>
          <h2>Warning</h2>
          <p>Out-of-Sample Molecule</p>
        </div>
      </div>
      <div>
        <Navbar />
      </div>
      <div style={{ display: "flex" }}>
        <SideNavigation />
        <div class="grid-container">
          {/* <div id="popup" class="popup">
            <div class="popup-content">
              <span class="close" onClick={closePopup}>
                &times;
              </span>
              <h2>Warning</h2>
              <p>Molecule outside of sample</p>
            </div>
          </div> */}
          <div class="itemin" style={{ zoom: "75%" }}>
            <div>
              <h1>Property Prediction</h1>
            </div>
            <hr id="specialhr" />
          </div>

          <div id="item221" style={{ zoom: "75%" }}>
            <div class="i2child1">
              <h4>Step 1:</h4>
              <div id="specialtext">
                To predict the properties of one molecule, please select{" "}
                <b>"Single Molecule"</b>. To predict the properties of a batch
                of molecules, please select <b>"Batch Molecules"</b>.
              </div>
            </div>
            <div style={{ display: "flex", paddingTop: "65px" }}>
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
                  onClick={uploadTrigger}
                />
              </div>
            </div>
          </div>
          <div id="item44">
            <hr />
            <div
              style={{ paddingTop: "20px", paddingBottom: "15px", zoom: "75%" }}
              class="i2child1"
            >
              <h4>Step 2:</h4>
              Please draw the molecule in the editor manually, or right-click
              the editor to paste the molecule from its SMILES representation.
            </div>
            <div style={{ display: "flex" }}>
              <Jsme
                height="350px"
                width="550px"
                options="oldlook,star"
                disabled={loading}
                onChange={logSmiles}
                // smiles={smiles}
              />
            </div>
            <div style={{ display: "flex", zoom: "88%" }}>
              <span>
                <input
                  type="text"
                  id="smileintake2"
                  value={smiles}
                  onChange={handleChange}
                />
              </span>
              <span
                class="iconspan"
                style={{ paddingTop: "33px" }}
                onClick={copyToClipboard2}
              >
                <MdContentCopy size={20} />
              </span>
              <span
                id="copyspan"
                style={{ display: "none", paddingTop: "10px" }}
              >
                Copied to Clipboard
              </span>
            </div>
            <div style={{display: "none"}}>
              <input type='submit' value="Convert to 3D" className='emmanual' onClick={make3dAppear} />
            </div> 
            <div id="show3d"> 
                
              </div>
          </div>

          <div id="item5">
            <hr />
            <div style={{ marginTop: "10px", paddingTop: "10px", zoom: "75%" }}>
              <div>
                <h4>Step 3:</h4>
                Please select an appropriate AI model and click <b>
                  Predict </b> to process.
              </div>
              <select name="models" id="modeldropdown22">
                <option value="model1">Blue Dopant (b3pw91)</option>
                <option value="model2">Blue Dopant (cam-b3lyp)</option>
                <option value="model3">Blue Host (b3pw91)</option>
              </select>
              <span>
                <input
                  type="submit"
                  name="callAI"
                  value="Predict"
                  id="aicaller2"
                  onClick={imageAICaller}
                />{" "}
              </span>
            </div>
          </div>
          <div id="item61">
            <hr />
            {imgresultData && imgresultData.length !== 0 && (
              <div style={{ zoom: "75%", display: "None" }}>
                <h2 style={{ marginTop: "40px" }}>Current Result:</h2>
                <div style={{ display: "flex" }}>
                  <img class="mainImg" src={mainImage} alt="no img" />
                  <table id="resTable3" style={{ marginTop: "20px" }}>
                    <tr>
                      <td className="tableheads">HOMO</td>
                      <td>{imgresultData[imgresultData.length - 1][0]}</td>
                      <td>
                        (({imgresultData[imgresultData.length - 1][0]}
                        -0.9899)/1.1206)
                      </td>
                    </tr>
                    <tr>
                      <td className="tableheads">LUMO</td>
                      <td>{imgresultData[imgresultData.length - 1][1]}</td>
                      <td>
                        (({imgresultData[imgresultData.length - 1][1]}
                        -2.0041)/1.3850)
                      </td>
                    </tr>
                    <tr>
                      <td className="tableheads">S1</td>
                      <td>{imgresultData[imgresultData.length - 1][2]}</td>
                      <td>/</td>
                    </tr>
                    <tr>
                      <td className="tableheads">S2</td>
                      <td>{imgresultData[imgresultData.length - 1][3]}</td>
                      <td>/</td>
                    </tr>
                  </table>
                </div>
              </div>
            )}
            <div id="errBox" style={{ display: "none", zoom: "75%" }}>
              <h2 style={{ marginTop: "40px" }}>Current Result:</h2>
              <div id="wrongBox">Please input a valid non-empty smiles.</div>
            </div>
          </div>
        </div>
        <div id="resultviewer" style={{ zoom: "85%" }}>
          <div id="headAndPend" style={{display: "flex"}}>
              <h2>All Results</h2>
          </div>  
          <hr id="resLiner" />
          <div class="checkcheck" id="checkpointhere">
            {imageUrl &&
              imgresultData &&
              imageUrl.length !== 0 &&
              imgresultData.map((oneImg, index) => {
                return (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      marginBottom: "20px",
                      marginLeft: "40px",
                      transform: "scale(1.1)",
                    }}
                  >
                    {index === 0 && (
                      <div style={{ marginTop: "10px", width: "100%" }}>
                        Current Result
                      </div>
                    )}
                    <img class="molImage" src={imageUrl[index]} alt="no img" />
                      
                    <table
                      id="resTable2"
                      style={{ marginTop: "25px", fontSize: "12px" }}
                    >
                      <tr>
                        <td
                          className="tableheads"
                          style={{ padding: "3px 7px 3px 7px" }}
                        >
                          HOMO
                        </td>
                        <td style={{ padding: "3px 7px 3px 7px" }}>
                          {oneImg[0].toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="tableheads"
                          style={{ padding: "3px 7px 3px 7px" }}
                        >
                          Corr. H
                        </td>
                        <td>
                          <td style={{ padding: "3px 7px 3px 10px" }}>
                            {((oneImg[0] - 0.9899) / 1.1206).toFixed(2)}
                          </td>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="tableheads"
                          style={{ padding: "3px 7px 3px 7px" }}
                        >
                          LUMO
                        </td>
                        <td style={{ background: "white" }}>
                          {oneImg[1].toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="tableheads">Corr. L</td>
                        <td style={{ background: "white", padding: "3px 7px 3px 7px" }} >
                          {((oneImg[1] - 2.0041) / 1.385).toFixed(2)}
                        </td>
                      </tr>
                        {
                         oneImg[5] === "m1" && (
                              <tr>
                                <td
                                  className="tableheads"
                                  style={{ padding: "3px 7px 3px 7px" }}
                                >
                                  S1
                                </td>
                                <td style={{ background: "white" }}>
                                  {oneImg[2]}
                                </td>
                              </tr>
                         )   
                        }
                        {
                         oneImg[5] === "m2" && (
                              <tr>
                                <td
                                  className="tableheads"
                                  style={{ padding: "3px 7px 3px 7px" }}
                                >
                                  S1 (Sol.)
                                </td>
                                <td style={{ background: "white" }}>
                                  {((oneImg[2] - 0.4113) / 1.0831).toFixed(2)}
                                </td>
                              </tr>
                         )   
                        }
                        {
                         oneImg[5] === "m3" && (
                              <tr>
                                <td
                                  className="tableheads"
                                  style={{ padding: "3px 7px 3px 7px" }}
                                >
                                  S1 
                                </td>
                                <td style={{ background: "white" }}>
                                  {oneImg[2].toFixed(2)}
                                </td>
                              </tr>
                         )   
                        }
                        {
                         oneImg[5] === "m1" && (
                              <tr>
                                <td
                                  className="tableheads"
                                  style={{ padding: "2px 7px 2px 7px" }}
                                >
                                  SI
                                </td>
                                <td style={{ background: "white" }}>
                                  {oneImg[3].toFixed(2)}
                                </td>
                              </tr> 
                         )   
                        }
                        {
                         oneImg[5] !== "m1" && (
                              <tr>
                                <td
                                  className="tableheads"
                                  style={{ padding: "2px 7px 2px 7px" }}
                                >
                                  T1
                                </td>
                                <td style={{ background: "white" }}>
                                  {oneImg[3].toFixed(2)}
                                </td>
                              </tr> 
                         )   
                        }

                    </table>
                    {index === 0 && (
                      <div style={{ marginTop: "10px", width: "90%" }}>
                        <hr
                          style={{
                            marginTop: "30px",
                            width: "90%",
                            justifyContent: "center",
                            marginBottom: "10px",
                          }}
                        />
                        <div
                          style={{
                            marginTop: "10px",
                            width: "100%",
                            marginLeft: "10px",
                          }}
                        >
                          Past Results
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}



