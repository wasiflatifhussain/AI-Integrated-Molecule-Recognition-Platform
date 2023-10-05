import React, { useEffect, useRef, useState } from 'react';
import { parsePath, useNavigate } from 'react-router-dom';
import "./Upload.css";
import Navbar from '../components/Navbar';
import SideNavigation from '../components/SideNavigation';
import { Jsme } from 'jsme-react';
import axios from 'axios';
import {MdContentCopy} from 'react-icons/md';
import DropZone from '../components/DropZone';
import loadLogo from "./loadingani.gif";
import {saveAs} from "file-saver";
import Papa from 'papaparse';
import Histogram from '../components/Histogram';


export default function Upload() {
    let navigate = useNavigate();
    const [csvData, setCSVData] = useState(null);

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
        navigate("/predictions/upload");
      }
    }, []);
    const [loading, setLoading] = React.useState(false);
    const [imageUrl1, setImageUrl1] = React.useState('');
    const [imageUrl2, setImageUrl2] = React.useState('');
    const [imageUrl3, setImageUrl3] = React.useState('');
    const [imageUrl4, setImageUrl4] = React.useState('');
    const [smiles, setSmiles] = React.useState('');
    const [textSmiles,settextSmiles] = React.useState('');
    const [textImageUrl, settextImageUrl] = React.useState('');
    const [resultData, setresultData] = React.useState('');
    const [imgresultData, setimgresultData] = React.useState('');
    const [modelName,setModelName] = React.useState('');
    
    const [receivedData, setReceivedData] = React.useState('');

    const [rangedData, setRangedData] = React.useState('');

    const idVal = {
      0: "smile0",
      1: "smile1",
      2: "smile2",
      3: "smile3",
      4: "smile4",
      5: "smile5",
      6: "smile6",
      7: "smile7",
      8: "smile8",
      9: "smile9"
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
        
        axios.get("/getImage", {
          params: {
            smiles: `${smiles}`
          }
        })
            .then (
              res => {
                const dataUrl = `data:image/png;base64,${res.data.image}`;
                setImageUrl1(dataUrl);
                console.log("Success");
            })
            .catch(err => {
              console.log(err);
            })     
    }

    const massAICaller = () =>  {

      document.getElementById("item677").style.display = "none";
      document.getElementById("item6").style.display = "block";
      setresultData(null);
      setImageUrl1(null);
      setImageUrl2(null);
      setImageUrl3(null);
      setImageUrl4(null);
      setRangedData(null);

      const model = document.getElementById("modeldropdown").value;
      setModelName(model);
      if (model === 'model1') {
          const backendURL = process.env.REACT_APP_BACKEND_IP;
          axios.post(`${backendURL}/getMassResult`, {
            body: JSON.stringify(receivedData)
          })
          .then (
            response => {
              if (response.data === "Not a valid file") {
                document.getElementById("item6").style.display = "none";
                document.getElementById("item677").style.display = "block";
              }
              else {
                console.log(response.data);
                console.log(response.data.homos);
                setresultData(response.data.predictions);
                  
                const dataUrl1 = `data:image/jpeg;base64,${response.data.homos}`;
                const dataUrl2 = `data:image/jpeg;base64,${response.data.lumos}`;
                const dataUrl3 = `data:image/jpeg;base64,${response.data.s1}`;
                const dataUrl4 = `data:image/jpeg;base64,${response.data.s2}`;
                setImageUrl1(dataUrl1);
                setImageUrl2(dataUrl2);
                setImageUrl3(dataUrl3);
                setImageUrl4(dataUrl4);
                  
                document.getElementById("item6").style.display = "none";
                document.getElementById("item677").style.display = "none";

              }
    
            }
          )
      } else if (model === 'model2') {
          const backendURL = process.env.REACT_APP_BACKEND_IP3;
          const username = localStorage.getItem('username');
          console.log(username)
          axios.post(`${backendURL}/getMassResult2`, {
            body: JSON.stringify(receivedData)
          },{
            params: {
              username:username,
            }
          })
          .then (
            response => {
                prepareResultData1();
            })
          .catch(error => {
              console.log(error);
              prepareResultData1();
          })
      } else if (model === 'model3') {
          const backendURL = process.env.REACT_APP_BACKEND_IP3;
          const username = localStorage.getItem('username');
          
          axios.post(`${backendURL}/getMassResult3`, {
            body: JSON.stringify(receivedData)
          },{
            params: {
              username:username,
            }
          })
          .then (
            response => {
                //fakecall2();
                prepareResultData2();

            })
          .catch(error => {
              console.log(error);
              //fakecall2();
              prepareResultData2();
          })
      }

    }
    
    const prepareResultData1 = () => {
        const backendURL = process.env.REACT_APP_BACKEND_IP3;
        const username = localStorage.getItem('username');
        axios.get(`${backendURL}/getBNMass`, {
            params: {
              username: username,
            }  
        })
          .then(response => {
            setresultData(response.data.predictions);
            console.log(response.data.predictions);
            const dataUrl1 = `data:image/jpeg;base64,${response.data.homos}`;
            const dataUrl2 = `data:image/jpeg;base64,${response.data.lumos}`;
            const dataUrl3 = `data:image/jpeg;base64,${response.data.s1}`;
            const dataUrl4 = `data:image/jpeg;base64,${response.data.s2}`;
            setImageUrl1(dataUrl1);
            setImageUrl2(dataUrl2);
            setImageUrl3(dataUrl3);
            setImageUrl4(dataUrl4);
            document.getElementById("item6").style.display = "none";
            document.getElementById("item677").style.display = "none";  
          });

    };

    const prepareResultData2 = () => {
        const backendURL = process.env.REACT_APP_BACKEND_IP3;
        const username = localStorage.getItem('username');
        
        axios.get(`${backendURL}/getBHMass`, {
            params: {
              username:username,
            }
        })
          .then(response => {
            setresultData(response.data.predictions);
            console.log(response.data.predictions);
            const dataUrl1 = `data:image/jpeg;base64,${response.data.homos}`;
            const dataUrl2 = `data:image/jpeg;base64,${response.data.lumos}`;
            const dataUrl3 = `data:image/jpeg;base64,${response.data.s1}`;
            const dataUrl4 = `data:image/jpeg;base64,${response.data.s2}`;
            setImageUrl1(dataUrl1);
            setImageUrl2(dataUrl2);
            setImageUrl3(dataUrl3);
            setImageUrl4(dataUrl4);
            document.getElementById("item6").style.display = "none";
            document.getElementById("item677").style.display = "none";  
          });

        
    };

    const fakecall2 = () => {
        const backendURL = process.env.REACT_APP_BACKEND_IP3;
        axios.get(`${backendURL}/getBHMass`)
    }

    const copyToClipboard = (val) => {
      // console.log(val);
      var copyText = document.getElementById(val).textContent;
      console.log(copyText)
      navigator.clipboard.writeText(copyText);
      document.getElementById("copysuccess").innerHTML="Copied to clipboad";
      setTimeout(function() {
        document.getElementById("copysuccess").innerHTML="";
      },1000)
    }
    const copyToClipboard2 = (val) => {
      const copyText = document.getElementById(val).textContent;

      // Attempt to use the writeText() method
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(copyText)
          .then(() => {
            // Success: Show copy confirmation message
            document.getElementById("copysuccess").innerHTML =
              "Copied to clipboard";
            setTimeout(() => {
              document.getElementById("copysuccess").innerHTML = "";
            }, 1000);
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
        document.getElementById("copysuccess").innerHTML = "Copied to clipboard";
        setTimeout(() => {
          document.getElementById("copysuccess").innerHTML = "";
        }, 1000);
      } catch (error) {
        // Error: Unable to copy
        console.error("Unable to copy to clipboard:", error);
      }

      document.body.removeChild(textArea);
    };


    const handleChange = (e) => {
      const { value } = e.target;
      console.log(value);
      setSmiles(value);
    };

    const handleReceivedData = (data) => {
        setReceivedData(data);
        //console.log(data);
        document.getElementById("item6").style.display = "none";
        // document.getElementById("uploadedData").innerHTML = data
    }

    const rangeSetter = (e) => {
      if (e) {
        e.preventDefault();
      }
      // console.log(typeof document.getElementById("modeldropdown2").value);
      // console.log(typeof document.getElementById("lowerrange").value);
      // console.log(typeof document.getElementById("upperrange").value);
      let getIdx = {
        "homo": 0,
        "lumo": 1,
        "s1" : 2,
        "t1" : 3
      }
      let sorter = document.getElementById("modeldropdown2") ? document.getElementById("modeldropdown2").value || "homo" : "homo";
      console.log(sorter);
      let sortIdx = getIdx[sorter];
      console.log(sortIdx);

        let homolr = document.getElementById("homolr") ? (parseFloat(document.getElementById("homolr").value) !== null ? parseFloat(document.getElementById("homolr").value) : -3.0) : -3.0;
        let homour = document.getElementById("homour") ? (parseFloat(document.getElementById("homour").value) !== null ? parseFloat(document.getElementById("homour").value) : -8.0) : -8.0;
        let lumolr = document.getElementById("lumolr") ? (parseFloat(document.getElementById("lumolr").value) !== null ? parseFloat(document.getElementById("lumolr").value) : 0.0) : 0.0;
        let lumour = document.getElementById("lumour") ? (parseFloat(document.getElementById("lumour").value) !== null ? parseFloat(document.getElementById("lumour").value) : -4.0) : -4.0;
        let s1lr = document.getElementById("s1lr") ? (parseFloat(document.getElementById("s1lr").value) !== null ? parseFloat(document.getElementById("s1lr").value) : 0.0) : 0.0;
        let s1ur = document.getElementById("s1ur") ? (parseFloat(document.getElementById("s1ur").value) !== null ? parseFloat(document.getElementById("s1ur").value) : 7.0) : 7.0;
        let s2lr = document.getElementById("s2lr") ? (parseFloat(document.getElementById("s2lr").value) !== null ? parseFloat(document.getElementById("s2lr").value) : 0.0) : 0.0;
        let s2ur = document.getElementById("s2ur") ? (parseFloat(document.getElementById("s2ur").value) !== null ? parseFloat(document.getElementById("s2ur").value) : 7.0) : 7.0;

      console.log(homolr + " " + homour + " " +lumolr + " " + lumour + " "+ s1lr + " " + s1ur + " " + s2lr + " " + s2ur + " "); 
      let resultArr = []
      for (let i = 0; i < resultData.length; ++i) {
        if (parseFloat(resultData[i][1]) <= homolr && parseFloat(resultData[i][1]) >= homour && parseFloat(resultData[i][2]) <= lumolr && parseFloat(resultData[i][2]) >= lumour && parseFloat(resultData[i][3]) >= s1lr && parseFloat(resultData[i][3]) <= s1ur && parseFloat(resultData[i][4]) >= s2lr && parseFloat(resultData[i][4]) <= s2ur) {
          console.log("bingo")
          resultArr.push(resultData[i]);
          
        }
      }
      
      setRangedData(resultArr);
    }

    const downloadInitiate = () => {
      var tempResData = rangedData;
      var mod = document.getElementById("modeldropdown").value;
        console.log(mod)
      if (mod === "model1") {
          tempResData.unshift(["SMILES","HOMO","LUMO","S1","SI"]);
      } else if (mod === "model2") {
          tempResData.unshift(["SMILES","HOMO","LUMO","S1","T1"]);
      }else if (mod === "model3") {
          tempResData.unshift(["SMILES","HOMO","LUMO","S1","T1"]);
      }
      
      //let tempResData = [["SMILES","HOMO","LUMO","S1","S2"]]

      const content = Papa.unparse(tempResData);
      const blob = new Blob([content], {type: "text/csv;charset=utf-8" });
      saveAs(blob, "data.csv");
    }

    const downloadSample = (val) => {
      const text = `SMILES
CC1=CC=C2C(=C1)B1C3=C(N2C2=CC=C4C(=C2)C2=CC=CC=C2O4)C=C(C=C3N(C2=C1SC1=C2C(=CC=C1)N(C1=CC=CC=C1)C1=CC=CC=C1)C1=CC=CC(=C1)C(C)(C)C)N(C1=CC=CC=C1)C1C=CC=CC=1
CC1C=CC2=C(C=1)B1C3SC4C(C=3N(C3=C1C(N2C1=CC=C2C(=C1)OC1C2=CC=CC=1)=CC(=C3)N(C1=CC=CC=C1)C1C=CC=CC=1)C1=CC=CC(=C1)C(C)(C)C)=CC(=CC=4)N(C1=CC=CC=C1)C1C=CC=CC=1
CC1=CC2N(C3C=CC(=CC=3)C(C)(C)C)C3C=CC(=CC=3B3C=2C(=C1)N1C2C=CC(=CC=2C2=C4C1=C3SC4=CC(=C2)C(C)(C)C)C(C)(C)C)C(C)(C)C
CC(C1C=CC=C(C=1)N1C(=NC2C1=CC1N(C3C=C(C=C4C=3B(C=1C=2)C1SC2=C(C=1N4C1=CC=CC(=C1)C(C)(C)C)C=CC=C2)N1C2C=CC=CC=2C2C1=CC=CC=2)C1=CC=CC2=C1C1C=CC=CC=1S2)C1C=CC2=C(C=1)C1=CC=CC=C1S2)(C)C
C1C=C2C3=C(C=1)N1C4=CC=CC=C4C4C1=C(B3C1C3N2C2=CC=CC=C2C=3C=CC=1)C=CC=4
`;
const blob = new Blob([text],{type: "text/csv;charset=utf-8"});
saveAs(blob,"sample."+val)

    }
    
  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div style={{ display: "flex" }}>
        <SideNavigation />
        <div class="grid-container" style={{ zoom: "75%" }}>
          <div class="item1">
            <div style={{ paddingBottom: "0px" }}>
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
                  onClick={uploadTrigger}
                />
              </div>
            </div>
          </div>
          <div id="item4">
            <hr />
            <div style={{ paddingTop: "20px", paddingBottom: "0px" }}>
              <h4>Step 2:</h4>
              <div style={{ display: "flex" }}>
                <div tyle={{ width: "45%" }}>
                  Please upload a file containing SMILES strings for{" "}
                  <b>mass prediction</b> of molecular properties.
                </div>
                <div
                  style={{
                    width: "45%",
                    marginLeft: "90px",
                    marginBottom: "10px",
                  }}
                >
                  <b>Note:</b>The first line should be "SMILES", followed by
                  lines of SMILES strings.
                </div>
              </div>
            </div>
            <div style={{ display: "flex" }}>
              <DropZone receiveParseData={handleReceivedData} />

              <div style={{ width: "40%", marginLeft: "-60px" }}>
                <div className="egBox">
                  <div>SMILES</div>
                  <div>
                    CC1=CC=C2C(=C1)B1C3=C(N2C2=CC=C4C(=C2)C2=CC=CC=C2O4)C=C(C=C3N(C2=C1SC1=C2C(=CC=C1)N(C1=CC=CC=C1)C1=CC=CC=C1)C1=CC=CC(=C1)C(C)(C)C)N(C1=CC=CC=C1)C1C=CC=CC=1
                  </div>
                  <div>
                    CC1C=CC2=C(C=1)B1C3SC4C(C=3N(C3=C1C(N2C1=CC=C2C(=C1)OC1C2=CC=CC=1)=CC(=C3)N(C1=CC=CC=C1)C1C=CC=CC=1)C1=CC=CC(=C1)C(C)(C)C)=CC(=CC=4)N(C1=CC=CC=C1)C1C=CC=CC=1
                  </div>
                  <div>
                    CC1=CC2N(C3C=CC(=CC=3)C(C)(C)C)C3C=CC(=CC=3B3C=2C(=C1)N1C2C=CC(=CC=2C2=C4C1=C3SC4=CC(=C2)C(C)(C)C)C(C)(C)C)C(C)(C)C
                  </div>
                  <div>
                    CC(C1C=CC=C(C=1)N1C(=NC2C1=CC1N(C3C=C(C=C4C=3B(C=1C=2)C1SC2=C(C=1N4C1=CC=CC(=C1)C(C)(C)C)C=CC=C2)N1C2C=CC=CC=2C2C1=CC=CC=2)C1=CC=CC2=C1C1C=CC=CC=1S2)C1C=CC2=C(C=1)C1=CC=CC=C1S2)(C)C
                  </div>
                  <div>
                    C1C=C2C3=C(C=1)N1C4=CC=CC=C4C4C1=C(B3C1C3N2C2=CC=CC=C2C=3C=CC=1)C=CC=4
                  </div>
                </div>
                <input
                  type="submit"
                  value="Download .csv Sample"
                  id="sampledown"
                  class="sampledown"
                  onClick={() => downloadSample("csv")}
                />
                <input
                  type="submit"
                  value="Download .txt Sample"
                  id="sampledown"
                  class="sampledown"
                  onClick={() => downloadSample("txt")}
                  style={{ marginLeft: "15px" }}
                />
              </div>
            </div>
          </div>
          <div id="item7">
            <hr />
            <div style={{ marginTop: "10px", paddingTop: "10px" }}>
              <div>
                <h4>Step 3:</h4>
                <div>
                  Please review the uploaded data before processing. Re-upload
                  the file in case of an error.
                </div>
                <div id="uploadedData">
                  <pre dangerouslySetInnerHTML={{ __html: receivedData }} />
                </div>
              </div>
              {/* <select name="models" id="modeldropdown">
                      <option value="model1">Model 1</option>
                      <option value="model2">Model 2</option>
                    </select>
                    <span><input type='submit' name="callAI" value="Call AI Model" id="aicaller2" onClick={imageAICaller}/> </span> */}
            </div>
          </div>
          <div id="item5">
            <hr />
            <div style={{ marginTop: "10px", paddingTop: "10px" }}>
              <div>
                <h4>Step 4:</h4>
                Please select an appropriate AI model and click <b>
                  Predict
                </b>{" "}
                to process.
              </div>
              <select name="models" id="modeldropdown">
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
                  onClick={massAICaller}
                />{" "}
              </span>
            </div>
          </div>

          <div id="item6">
            <hr />
            <div style={{ paddingTop: "40px" }}>
              <h4>Step 5:</h4>
              <div>
                Please select range parameters to process and view specific
                data.
              </div>
              <div>
                <img src={loadLogo} alt="loadalt" id="loadingimg" />
                <p
                  style={{
                    textAlign: "center",
                    color: "#f54343",
                    fontSize: "13px",
                  }}
                >
                  Please wait for the AI model to process data.
                </p>
              </div>
            </div>
          </div>
          <div id="item677">
            <hr />
            <div style={{ paddingTop: "40px" }}>
              <h4>Step 5:</h4>
              <div style={{ color: "#f54343" }}>
                The data input file did not meet the required input criteria and
                produced null data. Please make sure the input file meets the
                data format specified and <b>try again.</b>
              </div>
            </div>
          </div>

          <div>
            {imageUrl1 && imageUrl2 && imageUrl3 && imageUrl4 && (
              <div style={{ marginBottom: "30px" }}>
                <div style={{ display: "flex" }}>
                  <img
                    src={imageUrl1}
                    alt="no img"
                    style={{ width: "300px", height: "250px" }}
                  />
                  <img
                    src={imageUrl2}
                    alt="no img"
                    style={{ width: "300px", height: "250px" }}
                  />

                  <img
                    src={imageUrl3}
                    alt="no img"
                    style={{ width: "300px", height: "250px" }}
                  />
                  <img
                    src={imageUrl4}
                    alt="no img"
                    style={{ width: "300px", height: "250px" }}
                  />
                </div>
              </div>
            )}
          </div>

          <div id="item8">
            <hr />
            {resultData && (
              <div style={{ paddingTop: "40px" }}>
                <h4>Step 5:</h4>
                <div>
                  Please select range parameters to process and view specific
                  data.
                </div>
                <span style={{ display: "inline-block" }}>
                  <form style={{ marginBottom: "30px" }}>
                    <input type="text" id="homomdl" value="HOMO" disabled />
                    <input
                      type="text"
                      id="homolr"
                      defaultValue="-3.0"
                      required
                    />
                    <span> ~ </span>
                    <input
                      type="text"
                      id="homour"
                      defaultValue="-8.0"
                      required
                    />

                    <input type="text" id="lumomdl" value="LUMO" disabled />
                    <input
                      type="text"
                      id="lumolr"
                      defaultValue="0.0"
                      required
                    />
                    <span> ~ </span>
                    <input
                      type="text"
                      id="lumour"
                      defaultValue="-4.0"
                      required
                    />

                    <input type="text" id="s1mdl" value="S1" disabled />
                    <input type="text" id="s1lr" defaultValue="0.0" required />
                    <span> ~ </span>
                    <input type="text" id="s1ur" defaultValue="7.0" required />

                    {document.getElementById("modeldropdown").value === "model1" && (
                        <input type="text" id="s2mdl" value="SI" disabled />
                    )}
                    {document.getElementById("modeldropdown").value !== "model1" && (
                        <input type="text" id="s2mdl" value="TI" disabled />
                    )}
                    
                    <input type="text" id="s2lr" defaultValue="0.0" required />
                    <span> ~ </span>
                    <input type="text" id="s2ur" defaultValue="7.0" required />

                    <span>
                      <br />
                      <input
                        type="submit"
                        name="callAI"
                        value="Get Ranged Data"
                        id="aicaller3"
                        onClick={rangeSetter}
                      />{" "}
                    </span>
                  </form>
                </span>
                {rangedData && (
                  <div>
                    <h2>Results:</h2>
                    <div>
                      <span>
                        <input
                          type="button"
                          value="Download Results"
                          id="aicaller4"
                          onClick={downloadInitiate}
                        />
                      </span>
                      <span style={{ paddingLeft: "20px" }}>
                        Total Results Found: {rangedData.length}
                      </span>
                    </div>

                    <div
                      style={{ paddingTop: "20px", color: "#f54343" }}
                      id="copysuccess"
                    ></div>
                    <table
                      id="resTable5"
                      style={{ marginTop: "20px", marginBottom: "50px" }}
                    >
                        {
                             document.getElementById('modeldropdown').value === "model1" && 
                          (<tr>
                            <td className="tableheads5">SMILES</td>
                            <td className="tableheads5">HOMO</td>
                            <td className="tableheads5">LUMO</td>
                            <td className="tableheads5">S1</td>
                            <td className="tableheads5">SI</td>
                          </tr>)
                        }
                        {
                             document.getElementById('modeldropdown').value !== "model1" && 
                          (<tr>
                            <td className="tableheads5">SMILES</td>
                            <td className="tableheads5">HOMO</td>
                            <td className="tableheads5">LUMO</td>
                            <td className="tableheads5">S1</td>
                            <td className="tableheads5">T1</td>
                          </tr>)
                        }
                      {rangedData.slice(0, 10).map((data, index) => {
                        //need to check if 10 elements exist or not first, cud be less than 10
                        document.getElementById("item6").style.display = "none";
                        return (
                          <tbody>
                            <td
                              style={{
                                maxWidth: "400px",
                                height: "60px",
                                textAlign: "left",
                                border: "1px solid #f54343",
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                                paddingLeft: "4px",
                              }}
                            >
                              <span
                                style={{
                                  flex: "1 1 300px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                id={idVal[index]}
                              >
                                {data[0]}
                              </span>
                              <span
                                class="iconspan"
                                onClick={copyToClipboard2.bind(
                                  this,
                                  idVal[index]
                                )}
                                style={{ marginLeft: "auto" }}
                              >
                                <MdContentCopy size={20} />
                              </span>
                            </td>
                            <td className="internaltabs">
                              {(Math.round(data[1] * 1000) / 1000).toFixed(2)}
                            </td>
                            <td className="internaltabs">
                              {(Math.round(data[2] * 1000) / 1000).toFixed(2)}
                            </td>
                            <td className="internaltabs">
                              {(Math.round(data[3] * 1000) / 1000).toFixed(2)}
                            </td>
                            <td className="internaltabs">
                              {(Math.round(data[4] * 1000) / 1000).toFixed(2)}
                            </td>
                          </tbody>
                        );
                      })}
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// changes made