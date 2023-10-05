import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css";
import Navbar from '../components/Navbar';
import SideNavigation from '../components/SideNavigation';
import { Jsme } from 'jsme-react';
import axios from 'axios';
import {MdContentCopy} from 'react-icons/md';


export default function Home() {
    let [loading, setLoading] = React.useState(false);
    const [imageUrl, setImageUrl] = React.useState('');
    const [smiles, setSmiles] = React.useState('');
    const [textSmiles,settextSmiles] = React.useState('');
    const [textImageUrl, settextImageUrl] = React.useState('');
    const [resultData, setresultData] = React.useState('');
    const [imgresultData, setimgresultData] = React.useState('');
    
    // useEffect(() => {
    //     console.log(smiles)
    // },[smiles])
    
    const atom_colors = [
      'rgba(0, 255, 0, 0.5)',
      'rgba(0, 255, 255, 0.5)',
      'rgba(0, 0, 255, 0.5)',
      'rgba(255, 0, 255, 0.5)',
      'rgba(255, 255, 0, 0.5)',
      'rgba(255, 0, 0, 0.5)',
      'rgba(128,0,0,0.5)',
      'rgba(199,21,133,0.5)',
      'rgba(75,0,130,0.5)',
      'rgba(50,205,50,0.5)',
      'rgba(0,0,255,0.5)',
      'rgba(124,252,0,0.5)',
      'rgba(60,179,113,0.5)',
      'rgba(255,235,205,0.5)',
      'rgba(0,128,0,0.5)',
      'rgba(85,107,47,0.5)',
      'rgba(147,112,219,0.5)',
      'rgba(224,255,255,0.5)',
      'rgba(173,216,230,0.5)',
      'rgba(240,128,128,0.5)',
      'rgba(255,192,203,0.5)',
      'rgba(72,61,139,0.5)',
      'rgba(255,182,193,0.5)',
      'rgba(250,235,215,0.5)',
      'rgba(127,255,212,0.5)',
      'rgba(0,0,139,0.5)',
      'rgba(210,105,30,0.5)',
      'rgba(102,205,170,0.5)',
      'rgba(210,180,140,0.5)',
      'rgba(255,127,80,0.5)',
      'rgba(135,206,235,0.5)',
      'rgba(0,128,128,0.5)',
      'rgba(144,238,144,0.5)',
      'rgba(244,164,96,0.5)',
      'rgba(0,100,0,0.5)',
      'rgba(255,140,0,0.5)',
      'rgba(255,69,0,0.5)',
      'rgba(128,0,0,0.5)',
      'rgba(72,209,204,0.5)',
      'rgba(245,222,179,0.5)',
      'rgba(165,42,42,0.5)',
      'rgba(218,165,32,0.5)',
      'rgba(221,160,221,0.5)',
      'rgba(128,128,0,0.5)',
      'rgba(255,165,0,0.5)',
      'rgba(153,50,204,0.5)',
      'rgba(0,206,209,0.5)',
      'rgba(255,0,255,0.5)',
      'rgba(47,79,79,0.5)',
      'rgba(250,250,210,0.5)',
      'rgba(139,0,0,0.5)',
      'rgba(255,99,71,0.5)',
      'rgba(135,206,250,0.5)',
      'rgba(255,255,224,0.5)',
      'rgba(0,0,128,0.5)',
      'rgba(100,149,237,0.5)',
      'rgba(0,191,255,0.5)',
      'rgba(0,250,154,0.5)',
      'rgba(0,139,139,0.5)',
      'rgba(95,158,160,0.5)',
      'rgba(238,130,238,0.5)',
      'rgba(205,92,92,0.5)',
      'rgba(255,20,147,0.5)',
      'rgba(255,228,196,0.5)',
      'rgba(128,0,128,0.5)',
      'rgba(218,112,214,0.5)',
      'rgba(127,255,0,0.5)',
      'rgba(138,43,226,0.5)',
      'rgba(160,82,45,0.5)',
      'rgba(255,215,0,0.5)',
      'rgba(255,255,0,0.5)',
      'rgba(255,250,205,0.5)',
      'rgba(65,105,225,0.5)',
      'rgba(238,232,170,0.5)',
      'rgba(152,251,152,0.5)',
      'rgba(250,128,114,0.5)',
      'rgba(245,245,220,0.5)',
      'rgba(0,255,255,0.5)',
      'rgba(0,255,255,0.5)',
      'rgba(30,144,255,0.5)',
      'rgba(143,188,143,0.5)',
      'rgba(32,178,170,0.5)',
      'rgba(205,133,63,0.5)',
      'rgba(0,255,0,0.5)',
      'rgba(188,143,143,0.5)',
      'rgba(176,224,230,0.5)',
      'rgba(0,255,127,0.5)',
      'rgba(148,0,211,0.5)',
      'rgba(139,69,19,0.5)',
      'rgba(175,238,238,0.5)',
      'rgba(233,150,122,0.5)',
      'rgba(216,191,216,0.5)',
      'rgba(0,0,205,0.5)',
      'rgba(139,0,139,0.5)',
      'rgba(222,184,135,0.5)',
      'rgba(46,139,87,0.5)',
      'rgba(240,230,140,0.5)',
      'rgba(189,183,107,0.5)',
      'rgba(220,20,60,0.5)',
      'rgba(178,34,34,0.5)',
      'rgba(123,104,238,0.5)',
      'rgba(219,112,147,0.5)',
      'rgba(107,142,35,0.5)',
      'rgba(255,248,220,0.5)',
      'rgba(173,255,47,0.5)',
      'rgba(255,160,122,0.5)',
      'rgba(255,105,180,0.5)',
      'rgba(25,25,112,0.5)',
      'rgba(34,139,34,0.5)',
      'rgba(70,130,180,0.5)',
      'rgba(106,90,205,0.5)',
      'rgba(184,134,11,0.5)',
      'rgba(255,0,0,0.5)',
      'rgba(64,224,208,0.5)',
      'rgba(186,85,211,0.5)',
      'rgba(154,205,50,0.5)'
      ];


    // const manualInputTrigger = () => {
    //   settextSmiles(document.getElementById('manualvalueholder').value)
    //   // document.getElementById("item3").style.display="block";
    //   document.getElementById("item4").style.display="None";
    // } 

    const drawTrigger = () => {
      document.getElementById("item4").style.display="block";
      // document.getElementById("item3").style.display="None";
    }

    const uploadTrigger = () => {

    }

    // const handleFormSubmit = (e) => {
    //   e.preventDefault();
    //   generateRDKitFromText()
    // }


    const logSmiles = (smile) => {
        setSmiles(smile);
        // document.getElementById("smileprompt").value += smile;
    };
    
    // const recordtextSmiles = () => {
    //   console.log(document.getElementById('manualvalueholder').value);
    //   settextSmiles(document.getElementById('manualvalueholder').value);
    // }

    function getSmilesText() {
        console.log(document.getElementsByClassName("gwt-TextArea gwt-TextArea-readonly").length);
    }

    function generateRDKit() {
        
        axios.get("/getImage", {
          params: {
            smiles: `${smiles}`
          }
        })
            .then (
              res => {
                const dataUrl = `data:image/png;base64,${res.data.image}`;
                setImageUrl(dataUrl);
                console.log("Success");
                // document.getElementById("aicaller2").style.display="inline-block";
                // document.getElementById("smileprompt").value = smiles;
            })
            .catch(err => {
              console.log(err);
            })
            //console.log("smiles val here? "+smiles)
            
    }

    // function generateRDKitFromText() {
    //     setresultData("");
    //     axios.get("/getImage", {
    //       params: {
    //         smiles: `${textSmiles}`
    //       }
    //     })
    //         .then (
    //           res => {
    //             if (res.data === "This is not a valid molecule.") {
    //               settextImageUrl("This is not a valid molecule.");
    //               document.getElementById("aicaller").style.display="none";
    //               console.log("Failure");
    //             }
    //             else {
    //               const dataUrl = `data:image/png;base64,${res.data.image}`;
    //               settextImageUrl(dataUrl);
    //               console.log("Success");
    //               document.getElementById("aicaller").style.display="inline-block";
    //               console.log("smile is" + textSmiles);
    //             }
    //         })
    //         .catch(err => {
    //           console.log(err);
    //         })
    // }

    function callAIModel() {
      console.log("in ai part " + textSmiles);
      axios.get("/getResult", {
        params: {
          smiles: textSmiles
        }
      })
      .then (
        res => {
          console.log(res.data);
          setresultData(res.data);
        }
      )
    }

    function imageAICaller() {
      console.log(smiles);
      axios.get("/getResult", {
        params: {
          smiles: smiles
        }
      })
      .then (
        res => {
          console.log(res.data);
          setimgresultData(res.data);
          document.getElementById("smileprompt").value = smiles;
        }
      )
    }

    function copyToClipboard() {
      var copyText = document.getElementById("smileintake").value;
      navigator.clipboard.writeText(copyText);
      document.getElementById("copyspan").style.display="inline-block";
      setTimeout(function() {
        document.getElementById("copyspan").style.display="none";
      },3000)
    }
  const handleChange = (e) => {
    const { value } = e.target;
    console.log(value);
    setSmiles(value);
  };
    
  return (
    <div>
        <div>
            <Navbar />
        </div>
        <div style={{display: "flex"}}>
            <SideNavigation />

            <div class="grid-container">
                <div class="item1">
                    <h1>Prediction of Properties</h1>
                </div>
                <div id="item2">
                  {/* <div class="eachBtn">
                      <input type='submit' name='entry' value="Manual Input" className="manual" onClick={manualInputTrigger}/>
                  </div> */}
                  <div class="eachBtn">
                      <input type='submit' name='entry' value="Input" className="manual" onClick={drawTrigger}/>
                  </div>
                  <div class="eachBtn">
                      <input type='submit' name='entry' value="Upload" className="manual" onClick={uploadTrigger} />
                  </div>
                </div>

                {/* <div id="item3">
                    <form onSubmit={handleFormSubmit} id="manualinputform">
                        <input type="text" name="smilestring" placeholder="Enter SMILES" id="manualvalueholder" onChange={recordtextSmiles} required/>
                        <input type="submit" name="submitBtn" value="Generate Img" id="manualsubmitter" />
                    </form>
                    <div id="showImage2">
                      {textImageUrl && textImageUrl !== "This is not a valid molecule." &&
                      <div>
                        <div style={{paddingTop:"20px",fontSize: "20px"}}>Generated Molecule</div>
                        <div id="imgTable">
                          <img src={textImageUrl} id="objectimg2" alt="pic not shown" />
                          {
                            resultData &&
                              <table id="resTable">
                                <tr>
                                  <td className='tableheads'>HOMO</td>
                                  <td>{resultData[0]}</td>
                                </tr>
                                <tr>
                                  <td className='tableheads'>LUMO</td>
                                  <td>{resultData[1]}</td>
                                </tr>
                                <tr>
                                  <td className='tableheads'>S1</td>
                                  <td>{resultData[2]}</td>
                                </tr>
                                <tr>
                                  <td className='tableheads'>S2</td>
                                  <td>{resultData[3]}</td>
                                </tr>
                              </table>
                          }

                        </div>
                      </div>
                      }
                      {textImageUrl && textImageUrl === "This is not a valid molecule." &&
                      <div>
                        <div style={{paddingTop:"20px",fontSize: "20px"}}>Generated Molecule</div>
                        <div id="errorbox">This is not a valid molecule.</div>
                      </div>
                      }
                    </div>
                    <input type='submit' name="callAI" value="Call AI Model" id="aicaller" className='manual'  onClick={callAIModel} />
                </div> */}
                <div id="item4">
                  <div style={{display: "flex"}}>
                    <Jsme 
                        height="400px"
                        width="600px"
                        options="oldlook,star"
                        disabled={loading}
                        onChange={logSmiles}
                        smiles={smiles}
                    />
                    <div id="showImage">
                      {imageUrl &&
                      <img src={imageUrl} id="objectimg" alt="pic not shown" />
                      }
                    </div>
                  </div>
                    <span><input type="text" id="smileintake" value={smiles} onChange={handleChange} /></span><span class="iconspan" onClick={copyToClipboard}><MdContentCopy size={20} /></span><span id="copyspan" style={{display: "none"}}>Copied to Clipboard</span>
                    <span><input type='submit' name="callAI" value="Call AI Model" id="aicaller2" className='manual' onClick={imageAICaller}/> </span>
                    
                    {/* need to remove */}
                    {/* <input type="text" name="smilegenerator" placeholder="Smiles Structure" value="" id="smileprompt" onClick={getSmilesText} disabled style={{display: "none"}}/> */}

                    <br></br>
                    <input type="submit" name="rdkitgen" value="Generate Img" id="rdkitgen" onClick={generateRDKit} />

                    <div id="imgfinalres">
                      {
                        imgresultData &&
                          <div>
                            Results:
                              <table id="resTable2">
                                <tr>
                                  <td className='tableheads'>HOMO</td>
                                  <td>{imgresultData[0]}</td>
                                </tr>
                                <tr>
                                  <td className='tableheads'>LUMO</td>
                                  <td>{imgresultData[1]}</td>
                                </tr>
                                <tr>
                                  <td className='tableheads'>S1</td>
                                  <td>{imgresultData[2]}</td>
                                </tr>
                                <tr>
                                  <td className='tableheads'>S2</td>
                                  <td>{imgresultData[3]}</td>
                                </tr>
                              </table>
                          </div>
                      }
                    </div>
                </div>




            </div>

        </div>
    </div>
  )
}
