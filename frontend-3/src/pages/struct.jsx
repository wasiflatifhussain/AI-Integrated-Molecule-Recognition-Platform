/* eslint-disable no-loop-func */
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import "./Structure.css"
import SideNavigation from '../components/SideNavigation';
// import a1 from "./molecules/C1=CC=CC=C1.png";
// import a2 from "./molecules/C12=CC=CC=C1C=CC=C2.png";
// import a3 from "./molecules/C12=CC=CC=C1N(C3=CC=CC=C3)C=C2.png";
// import a4 from "./molecules/C12=CC=CC=C1N(C3=CC=CC=C3)C4=C2C=CC=C4.png";
// import a5 from "./molecules/C12=CC=CC=C1OC=C2.png";
// import a6 from "./molecules/C12=CC=CC=C1OC3=C2C=CC=C3.png";
// import a7 from "./molecules/C12=CC=CC=C1SC=C2.png";
import a1 from "./molecules/1 copy.png";
import a2 from "./molecules/2.png";
import a3 from "./molecules/3.png";
import a4 from "./molecules/4.png";
import a5 from "./molecules/5 copy.png";
import a6 from "./molecules/6 copy.png";
import a7 from "./molecules/7 copy.png";
import { useSelector, useDispatch } from 'react-redux';
import { falsify, truthify } from '../redux/counter';
import axios from "axios";
import loadLogo from "./loadingani.gif";
import { saveAs } from 'file-saver';
import Papa from "papaparse";
import { MdContentCopy } from "react-icons/md";
import { Jsme } from 'jsme-react';
import { useNavigate } from 'react-router-dom';

export default function Structure() {

  const [allMolecules,setAllMolecules] = useState([]);
  const [addStatus, setAddStatus] = useState(false);
  const [removeIdx, setRemoveIdx] = useState(-1);
  const [confirmed,setConfirmed] = useState(false);
  const [stopAdding, setStopAdding] = useState(false);
  const [moleculeCount, setMoleculeCount] = useState(-1);

  const [buttonSwitch,setButtonSwitch] = useState()

  const [dataDict, setDataDict] = useState({});
  const [dataDict2, setDataDict2] = useState({});
  const [totalCount,setTotalCount] = useState(null);
  const [combinationData,setCombinationData] = useState(null);
  const [imageUrl1, setImageUrl1] = React.useState("");
  const [imageUrl2, setImageUrl2] = React.useState("");
  const [imageUrl3, setImageUrl3] = React.useState("");
  const [imageUrl4, setImageUrl4] = React.useState("");
  const [resultData, setresultData] = React.useState("");
  const [modelName, setModelName] = React.useState("");
  const [rangedData, setRangedData] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [smiles, setSmiles] = React.useState('');
  const [preProcess,setpreProcess] = React.useState("")
  
  // const [molDict,setMolDict] = React.useState ({
  //   "C1=CC=CC=C1" : [a1,'a1', 6, [0,1,2,3,4,5], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]]],
  //   "C12=CC=CC=C1C=CC=C2" : [a2,'a2', 10, [0,1,2,3,4,5,6,7,8,9], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,0]]],
  //   "C12=CC=CC=C1N(C3=CC=CC=C3)C=C2" : [a3,'a3', 15, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,0]]],
  //   "C12=CC=CC=C1N(C3=CC=CC=C3)C4=C2C=CC=C4" : [a4,'a4', 19, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,0]]],
  //   "C12=CC=CC=C1OC=C2" : [a5,'a5', 9, [0,1,2,3,4,5,6,7,8], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,0]]],
  //   "C12=CC=CC=C1OC3=C2C=CC=C3" : [a6,'a6', 13, [0,1,2,3,4,5,6,7,8,9,10,11,12], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,0]]],
  //   "C12=CC=CC=C1SC=C2" : [a7,'a7', 9, [0,1,2,3,4,5,6,7,8], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,0]]]
  // })

  const [molDict,setMolDict] = React.useState ({
    "C12=CC=CC=C1C=CC=C2" : [a1,'a1', 10],
    "C12=CC=CC([N]C=C3)=C1B3C=C[N]2" : [a2,'a2', 13],
    "C1(C=CC=C2)=C2OC=C1" : [a3,'a3', 9],
    "C1(C=CC=C2)=C2SC=C1" : [a4,'a4', 9],
    "C12=CC=CC=C1OC3=C2C=CC=C3" : [a5,'a5', 13],
    "C12=CC=CC=C1SC3=C2C=CC=C3" : [a6,'a6', 13],
    "C1([N]C2=CC=CC=C2)=CC=CC=C1" : [a7,'a7', 13]
  })


  // const [maxlen,setmaxlen] = React.useState({
  //   "C1=CC=CC=C1" :6,
  //   "C12=CC=CC=C1C=CC=C2" : 10,
  //   "C12=CC=CC=C1N(C3=CC=CC=C3)C=C2" : 15,
  //   "C12=CC=CC=C1N(C3=CC=CC=C3)C4=C2C=CC=C4" : 19,
  //   "C12=CC=CC=C1OC=C2" : 9,
  //   "C12=CC=CC=C1OC3=C2C=CC=C3" : 13,
  //   "C12=CC=CC=C1SC=C2" : 9,   
  // })

  const [maxlen,setmaxlen] = React.useState({
    "C12=CC=CC=C1C=CC=C2" : 10,
    "C12=CC=CC([N]C=C3)=C1B3C=C[N]2" : 13,
    "C1(C=CC=C2)=C2OC=C1" : 9,
    "C1(C=CC=C2)=C2SC=C1" : 9,
    "C12=CC=CC=C1OC3=C2C=CC=C3" : 13,
    "C12=CC=CC=C1SC3=C2C=CC=C3" : 13,
    "C1([N]C2=CC=CC=C2)=CC=CC=C1" : 13  
  })

  const [fragWeights, setfragWeights] = React.useState({
    "Fragment 0" : 128.062600256,
    "Fragment 1" : 166.07022862399998,
    "Fragment 2" : 118.041864812,
    "Fragment 3" : 134.019021192,
    "Fragment 4" : 168.057514876,
    "Fragment 5" : 184.034671256,
    "Fragment 6" : 168.08132432
  })

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
    9: "smile9",
  };
  // var dataDict = {}; //to be used to store all the dictionary data

  const logSmiles = (smile) => {
      setSmiles(smile);
  };

  const clickMsg = (val) => {
    const div1 = document.getElementById(val);
    div1.style.boxShadow = "inset 0 2px 10px red";
    const p = document.createElement("p");
    p.textContent = "Click to add to list";
    p.className = val + "p";
    setTimeout(() => {
      div1.appendChild(p);
    })    
  }

  const removeFromList = (name) => {
    // console.log(confirmed); 
    // console.log(allMolecules);
    if (confirmed === false) {
      console.log(name)
      const remover = parseInt(name);
      setRemoveIdx(remover);
      let arr = []
      for (let i = 0; i < allMolecules.length; ++i) {
        // console.log(allMolecules[i][1] !== remover)
        if (allMolecules[i][1] !== remover) {
          arr.push(allMolecules[i])
        }
      }
      // console.log(arr)
      setAllMolecules(arr);
      setAddStatus(true);
    }
  };

  const addToList = (val) => {
    // console.log(val);
    if (confirmed === false) {
      if (allMolecules.length >= 7) {
        displayAddPreventMsg();
      }
      else {
        // console.log(allMolecules);
        const tempVal = moleculeCount + 1;
        setMoleculeCount(moleculeCount => moleculeCount + 1);
        setAllMolecules([...allMolecules,[val,tempVal]]);
        setAddStatus(true);
        console.log("added")
        console.log(allMolecules)
      }
    }
  };

  const autoAddToList = (val,count) => {
    // console.log(val);
    if (confirmed === false) {
      if (allMolecules.length >= 7) {
        displayAddPreventMsg();
      }
      else {
        // console.log(allMolecules);
        const tempVal = moleculeCount + 1;
        setMoleculeCount(moleculeCount => moleculeCount + 1);
        setAllMolecules(allMolecules => [...allMolecules,[val,count]]);
        setAddStatus(true);
        console.log("added")
        console.log(allMolecules)
      }
    }
  };

  const displayAddPreventMsg = () => {
    const parentEle = document.getElementById("items2");
    if (parentEle.lastChild.textContent !== "Maximum number of molecules already added.") {
      const errMsg = document.createElement("p");
      errMsg.textContent = "Maximum number of molecules already added.";
      errMsg.style.color = "#f54343";
      errMsg.style.margin = "10px 0px 0px 18px";
      errMsg.style.zoom = "75%";
      parentEle.appendChild(errMsg);
      setTimeout(function() {
        parentEle.removeChild(parentEle.lastChild);
      },3000)
    }
  }

  const generateComponentData = (div,word,res) => {
    setDataDict2((prevDataDict) => {
      // Clone the previous dataDict object to avoid mutation
      const newDataDict = { ...prevDataDict };

      // Access the specified div and word and update the value
      if (newDataDict[div]) {
        newDataDict[div][word] = res;
      }

      // console.log(newDataDict);
      return newDataDict;
    });
  }

  const editComponentData = (div,word,res) => {
    setDataDict2((prevDataDict) => {
      // Clone the previous dataDict object to avoid mutation
      const newDataDict = { ...prevDataDict };

      // Access the specified div and word and update the value

      newDataDict[div][word] = res;


      // console.log(newDataDict);
      return newDataDict;
    });
  }

  const extractSubsets = (input,index) => {
    const keys = Object.keys(dataDict)
    const lengthOfStr = maxlen[dataDict[keys[index]]['altval']]
    // console.log(lengthOfStr)
    var array = []
    const subsets = input
      .split(",") // Split the input by commas
      .map((subset) => subset.trim()) // Trim any extra spaces
      .map((subset) => subset.replace(/\s+/g, "")); // Remove all spaces within subsets
      
    for (let i = 0; i < subsets.length - 1; ++i) {
      if (subsets[i][0] === "[" && subsets[i+1][subsets[i+1].length - 1] === "]") {
        let val = subsets[i] + "," + subsets[i+1]
        array.push(val)
        let substring1 = subsets[i + 1].substring(0, subsets[i + 1].length - 1);
        let substring2 = subsets[i].substring(1);
        let val2 = "[" + substring1 + "," + substring2 + "]";
        array.push(val2);
      }
      
    }
    // console.log(array);
    return array;
  };

  const viewAllMols = (val) => {
    if (val === "View All") {
      const mainDiv = document.getElementById("moleculeset");
      mainDiv.style.overflowX = "hidden";
      mainDiv.style.flexWrap = "wrap";
      document.getElementById("aicaller3").value = "Minimize";
    } else if (val === "Minimize") {
      const mainDiv = document.getElementById("moleculeset");
      mainDiv.style.overflowX = "scroll";
      mainDiv.style.flexWrap = "nowrap";
      document.getElementById("aicaller3").value = "View All";
    }
  };

  const confirmMolecules = () => {
    // console.log(document.getElementById("checker"));

    const dictToAdd = {};
    const dictToAdd2 = {}
    const tempElement = document.getElementById("checker");
    const imgTags = tempElement.getElementsByTagName("img");
    // console.log(imgTags);
    var childrenOfChecker = tempElement.getElementsByClassName("moleculeDivs");
    // console.log("childrenOfChecker");
    // console.log(childrenOfChecker[0].id)
    for (let i = 0; i < imgTags.length; ++i) {
      const altval = imgTags[i].getAttribute("alt");
      // console.log("altval = ",altval)
      if (i === 0) {
        dictToAdd[childrenOfChecker[i].id] = { altval, next: [] };
      } else {
        dictToAdd[childrenOfChecker[i].id] = { altval, prev: [], next: [] };
      }
    }

    // console.log(dictToAdd2);

    for (let i = 0; i < imgTags.length; ++i) {
      const altval = imgTags[i].getAttribute("alt");
      // console.log("altval = ",altval)
      if (i === 0) {
        dictToAdd2[childrenOfChecker[i].id] = { altval };
      } else {
        dictToAdd2[childrenOfChecker[i].id] = { altval };
      }
    }

    const relationchildren = document.getElementById("fragrelations");
    const divs = relationchildren.querySelectorAll('div');


    // console.log(dictToAdd);
    setDataDict(dictToAdd);
    
    
    console.log(dictToAdd2);
    var checker = true;

    divs.forEach((div) => {
      const input1 = div.querySelector('input:nth-of-type(1)');
      const input2 = div.querySelector('input:nth-of-type(2)');

      console.log(input1.value.length);
      console.log(input2.value.length);
      if (input1.value.length > 0 && input2.value.length > 0) {
        // console.log('Input 1:', input1.value);
        // console.log('Input 2:', input2.value);
        const i1 = parseInt(input1.value)
        const i2 = parseInt(input2.value)
        const name1 = "a"+ input2.value;
        const name2 = "a"+ input1.value;
        // console.log(name1);
        // console.log(name2);
        dictToAdd2[childrenOfChecker[i1].id][name1] = [];
        dictToAdd2[childrenOfChecker[i2].id][name2] = [];
      }
      else {
        checker = false;
      }
    });

    console.log(checker)
    if (checker === true) {
      // console.log(dictToAdd2);
      setConfirmed(true);
      setAddStatus(true);
      setDataDict2(dictToAdd2);
      document.getElementById("firstconfirmmsg").style.display = "none";
      document.getElementById("secondconfirmmsg").style.display = "block";
    }
  };


  function extractUniqueNumbers(inputString) {
    const numbers = inputString
      .replace(/\[|\]/g, "") // Remove square brackets
      .split(",") // Split the string by commas
      .map((num) => num.trim()) // Remove leading/trailing whitespace
      .filter((num) => !isNaN(parseInt(num))); // Filter out non-numeric values

    const uniqueNumbers = [...new Set(numbers)]; // Remove duplicates using Set

    return uniqueNumbers;
  }

  const generateCombos = () => {
    const backendURL = process.env.REACT_APP_BACKEND_IP;
    const username = localStorage.getItem("username");
    // console.log(backendURL);
    setTotalCount(null)
    setCombinationData(null)

    const sendDict = dataDict2;
    const tempkeys = Object.keys(dataDict2);
    const renamedDict = {}

    tempkeys.forEach((key,index) => {
      renamedDict[`${index}div`] = sendDict[key];
    })

    console.log(renamedDict);
    // setDataDict2(renamedDict)


    document.getElementById("loadscreen").style.display = "block";
    axios.post(`${backendURL}/preparecombos`, {
      body: renamedDict,
    }, {
      params : {
        username:username
      }
    })
    .then (
      response => {
        document.getElementById("loadscreen").style.display = "none";
        document.getElementById("item4special").style.display = "block";
        // console.log(response.data.count);
        setTotalCount(response.data.count);
        // console.log(response.data.result);
        setCombinationData(response.data.result)
      }
    )
    .catch (
      error => {
        console.error(error);
      }
    )
  }

  const downloadCsvFile = () => {
    var tempResData = combinationData;
    tempResData.unshift(["SMILES"]);
    const content = Papa.unparse(tempResData);
    const blob = new Blob([content],{type: "text/csv;charset=utf-8"});
    saveAs(blob, "combinations.csv");
  }

  const massAICaller = () => {
      // document.getElementById("item677").style.display = "none";
      document.getElementById("item619").style.display = "block";
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
        const username = localStorage.getItem("username");
        console.log(username);
        console.log(backendURL);
          axios.post(`${backendURL}/getStructureMassResults`, {
            body: username // Include the data directly in the request body, not in params
          })
          .then((response) => {
            setresultData(response.data.predictions);

            const dataUrl1 = `data:image/jpeg;base64,${response.data.homos}`;
            const dataUrl2 = `data:image/jpeg;base64,${response.data.lumos}`;
            const dataUrl3 = `data:image/jpeg;base64,${response.data.s1}`;
            const dataUrl4 = `data:image/jpeg;base64,${response.data.s2}`;
            setImageUrl1(dataUrl1);
            setImageUrl2(dataUrl2);
            setImageUrl3(dataUrl3);
            setImageUrl4(dataUrl4);

            document.getElementById("item619").style.display = "none";
          });
      } else if (model === 'model2') {
          const backendURL = process.env.REACT_APP_BACKEND_IP3;
          const username = localStorage.getItem('username');
          // console.log(username)
          axios.post(`${backendURL}/getStructMassResult2`, {
            body: username
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
          
          axios.post(`${backendURL}/getStructMassResult3`, {
            body: username
          })
          .then (
            response => {
                //fakecall2();
                prepareResultData2();

            })
          .catch(error => {
              // console.log(error);
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
            // console.log(response.data.predictions);
            const dataUrl1 = `data:image/jpeg;base64,${response.data.homos}`;
            const dataUrl2 = `data:image/jpeg;base64,${response.data.lumos}`;
            const dataUrl3 = `data:image/jpeg;base64,${response.data.s1}`;
            const dataUrl4 = `data:image/jpeg;base64,${response.data.s2}`;
            setImageUrl1(dataUrl1);
            setImageUrl2(dataUrl2);
            setImageUrl3(dataUrl3);
            setImageUrl4(dataUrl4);
            document.getElementById("item619").style.display = "none";
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
            // console.log(response.data.predictions);
            const dataUrl1 = `data:image/jpeg;base64,${response.data.homos}`;
            const dataUrl2 = `data:image/jpeg;base64,${response.data.lumos}`;
            const dataUrl3 = `data:image/jpeg;base64,${response.data.s1}`;
            const dataUrl4 = `data:image/jpeg;base64,${response.data.s2}`;
            setImageUrl1(dataUrl1);
            setImageUrl2(dataUrl2);
            setImageUrl3(dataUrl3);
            setImageUrl4(dataUrl4);
            document.getElementById("item619").style.display = "none";
            document.getElementById("item677").style.display = "none";  
          });

        
    };

    const handleChange = (e) => {
      const { value } = e.target;
      // console.log(value);
      setSmiles(value);
    };

    const copyToClipboard3 = () => {
      const copyText = document.getElementById("smileintaketemp")?.value || "";
      
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
      document.getElementById("copysuccess").innerHTML =
        "Copied to clipboard";
      setTimeout(() => {
        document.getElementById("copysuccess").innerHTML = "";
      }, 1000);
    } catch (error) {
      // Error: Unable to copy
      console.error("Unable to copy to clipboard:", error);
    }

    document.body.removeChild(textArea);
  };

  const downloadInitiate = () => {
    var tempResData = rangedData;
    var mod = document.getElementById("modeldropdown").value;
    // console.log(mod)
    // console.log(tempResData)
    if (mod === "model1") {
        tempResData.unshift(["SMILES","HOMO","Corr.H","LUMO","Corr.L","S1","SI"]);
    } else if (mod === "model2") {
        tempResData.unshift(["SMILES","HOMO","Corr.H","LUMO","Corr.L","S1 (Sol.)","T1"]);
    }else if (mod === "model3") {
        tempResData.unshift(["SMILES","HOMO","Corr.H","LUMO","Corr.L","S1","T1"]);
    }
    
    //let tempResData = [["SMILES","HOMO","LUMO","S1","S2"]]

    const content = Papa.unparse(tempResData);
    const blob = new Blob([content], {type: "text/csv;charset=utf-8" });
    saveAs(blob, "data.csv");
  }

    const rangeSetter = (e) => {
      if (e) {
        e.preventDefault();
      }

      let getIdx = {
        "homo": 0,
        "lumo": 1,
        "s1" : 2,
        "t1" : 3
      }
      let sorter = document.getElementById("modeldropdown2") ? document.getElementById("modeldropdown2").value || "homo" : "homo";
      // console.log(sorter);
      let sortIdx = getIdx[sorter];
      // console.log(sortIdx);

        let homolr = document.getElementById("homolr") ? (parseFloat(document.getElementById("homolr").value) !== null ? parseFloat(document.getElementById("homolr").value) : -3.0) : -3.0;
        let homour = document.getElementById("homour") ? (parseFloat(document.getElementById("homour").value) !== null ? parseFloat(document.getElementById("homour").value) : -8.0) : -8.0;
        let lumolr = document.getElementById("lumolr") ? (parseFloat(document.getElementById("lumolr").value) !== null ? parseFloat(document.getElementById("lumolr").value) : 0.0) : 0.0;
        let lumour = document.getElementById("lumour") ? (parseFloat(document.getElementById("lumour").value) !== null ? parseFloat(document.getElementById("lumour").value) : -4.0) : -4.0;
        let s1lr = document.getElementById("s1lr") ? (parseFloat(document.getElementById("s1lr").value) !== null ? parseFloat(document.getElementById("s1lr").value) : 0.0) : 0.0;
        let s1ur = document.getElementById("s1ur") ? (parseFloat(document.getElementById("s1ur").value) !== null ? parseFloat(document.getElementById("s1ur").value) : 7.0) : 7.0;
        let s2lr = document.getElementById("s2lr") ? (parseFloat(document.getElementById("s2lr").value) !== null ? parseFloat(document.getElementById("s2lr").value) : 0.0) : 0.0;
        let s2ur = document.getElementById("s2ur") ? (parseFloat(document.getElementById("s2ur").value) !== null ? parseFloat(document.getElementById("s2ur").value) : 7.0) : 7.0;

      // console.log(homolr + " " + homour + " " +lumolr + " " + lumour + " "+ s1lr + " " + s1ur + " " + s2lr + " " + s2ur + " "); 
      let resultArr = []
      for (let i = 0; i < resultData.length; ++i) {
        if (((parseFloat(resultData[i][1]) - 0.9899) / 1.1206) <= homolr && ((parseFloat(resultData[i][1]) - 0.9899) / 1.1206) >= homour && ((parseFloat(resultData[i][2]) - 2.0041) / 1.385) <= lumolr && ((parseFloat(resultData[i][2]) - 2.0041) / 1.385) >= lumour && parseFloat(resultData[i][3]) >= s1lr && parseFloat(resultData[i][3]) <= s1ur && parseFloat(resultData[i][4]) >= s2lr && parseFloat(resultData[i][4]) <= s2ur) {
          if (document.getElementById("modeldropdown").value === "model1") {
            let appendedData = [resultData[i][0],parseFloat(resultData[i][1]),((parseFloat(resultData[i][1]) - 0.9899) / 1.1206).toFixed(2),parseFloat(resultData[i][2]),((parseFloat(resultData[i][2]) - 2.0041) / 1.385).toFixed(2),parseFloat(resultData[i][3]),parseFloat(resultData[i][4])];
            resultArr.push(appendedData);
          }
          else if (document.getElementById("modeldropdown").value === "model3") {
            let appendedData = [resultData[i][0],parseFloat(resultData[i][1]),((parseFloat(resultData[i][1]) - 0.9899) / 1.1206).toFixed(2),parseFloat(resultData[i][2]),((parseFloat(resultData[i][2]) - 2.0041) / 1.385).toFixed(2),parseFloat(resultData[i][3]),parseFloat(resultData[i][4])];
            resultArr.push(appendedData);
          }
        }
        if (((parseFloat(resultData[i][1]) - 0.9899) / 1.1206) <= homolr && ((parseFloat(resultData[i][1]) - 0.9899) / 1.1206) >= homour && ((parseFloat(resultData[i][2]) - 2.0041) / 1.385) <= lumolr && ((parseFloat(resultData[i][2]) - 2.0041) / 1.385) >= lumour && ((parseFloat(resultData[i][3]) - 0.4113) / 1.0831) >= s1lr && ((parseFloat(resultData[i][3]) - 0.4113) / 1.0831) <= s1ur && parseFloat(resultData[i][4]) >= s2lr && parseFloat(resultData[i][4]) <= s2ur) {
          if (document.getElementById("modeldropdown").value === "model2") {
            let appendedData = [resultData[i][0],parseFloat(resultData[i][1]),((parseFloat(resultData[i][1]) - 0.9899) / 1.1206).toFixed(2),parseFloat(resultData[i][2]),((parseFloat(resultData[i][2]) - 2.0041) / 1.385).toFixed(2),((parseFloat(resultData[i][3]) - 0.4113) / 1.0831).toFixed(2),parseFloat(resultData[i][4])];
            resultArr.push(appendedData);
          }
        }
      }
      
      setRangedData(resultArr);
    }

  const generateFragment = () => {
    const sendSmile = smiles;
    // console.log(sendSmile);
    const backendURL = process.env.REACT_APP_BACKEND_IP;
    axios.get(`${backendURL}/getImgName`, {
        params: {
          smiles: `${smiles}`,
        },
    })
    .then ((res) => { 
      const dataUrl = `data:image/png;base64,${res.data.image}`;
      const coresmile = res.data.coresmile;
      const lenofsmile = res.data.lengthofsmile;
      setMolDict(prevMolDict => ({
        ...prevMolDict,
        [coresmile]:[dataUrl,`a${lenofsmile}`,lenofsmile]
      }))
      setmaxlen(prevlen => ({
        ...prevlen,
        [coresmile]:lenofsmile
      }))
      addToList(coresmile);
      // console.log(molDict)
      // console.log(maxlen)
    })
  }

  useEffect(() => {
    console.log(dataDict2);
    if (allMolecules.length >= 0 && allMolecules.length <= 7) {
      console.log(allMolecules);
      var checkerElement = document.getElementById("checker");
      checkerElement.innerHTML = "";

      for (let i = 0; i < allMolecules.length; ++i) {
        console.log(`${allMolecules[i][1]}div`);
        // console.log(dataDict2);
        // console.log(dataDict2[`${allMolecules[i][1]}div`]);
        const molecule = allMolecules[i][0];
        const index = allMolecules[i][1];

        const parentDiv = document.createElement("div");
        parentDiv.id = `${index}div`;
        parentDiv.className = "moleculeDivs";
        parentDiv.style.display = "flex";

        const divElement = document.createElement("div");
        divElement.className = "adderSection";
        divElement.style.position = "relative";

        const crossElement = document.createElement("div");
        const crossElementName = `${index}`;
        crossElement.setAttribute("data-cross-name", crossElementName);
        crossElement.className = "cross";
        crossElement.style.position = "absolute";
        crossElement.style.top = "0";
        crossElement.style.left = "0";
        crossElement.style.fontSize = "15px";
        crossElement.style.lineHeight = "1";
        crossElement.style.padding = "5px";
        crossElement.style.cursor = "pointer";
        crossElement.innerHTML = "&#x2716;";

        crossElement.addEventListener("click", () => {
          const name = crossElement.getAttribute("data-cross-name");
          removeFromList(name);
        });

        const numberelem = document.createElement("p");
        numberelem.style.marginLeft = "30px";
        numberelem.style.marginTop = "30px";
        numberelem.textContent = `Fragment ${i}`;
        numberelem.style.fontSize = "17px";

        const imgElement = document.createElement("img");
        imgElement.src = molDict[molecule][0];
        imgElement.alt = molecule;
        console.log(molDict[molecule][1])
        if (molDict[molecule][1] === 'a1') {
          imgElement.id = "speciala"
        }
        else if (molDict[molecule][1] === 'a5' || molDict[molecule][1] === 'a6' || molDict[molecule][1] === 'a6' || molDict[molecule][1] === 'a7') {
          imgElement.id = "speciala2"
        }
        else if (parseInt(molDict[molecule][1].substring(1)) < 10) {
          imgElement.id = 'a6';
        }
        else {
          imgElement.id = 'a100';
        } 

        // imgElement.id = molDict[molecule][1];
        imgElement.className = "themolImage";

        const pElement = document.createElement("p");
        pElement.style.width = "100%";
        pElement.style.whiteSpace = "nowrap";
        pElement.style.overflow = "hidden";
        pElement.style.fontSize = "12px";
        pElement.style.textAlign = "center";
        pElement.textContent = molecule;

        divElement.appendChild(crossElement);
        divElement.appendChild(numberelem);
        divElement.appendChild(imgElement);
        divElement.appendChild(pElement);

        parentDiv.appendChild(divElement);

        const div2 = document.createElement("div");

        // for next connections
        checkerElement = document.getElementById("checker");
        checkerElement.appendChild(parentDiv);
        setAddStatus(false);
        
        // go inside
        if (confirmed === true) {
          const keysForDict = Object.keys(dataDict2[`${allMolecules[i][1]}div`])
          console.log("keysfordict = " + keysForDict);
          for (let a = 1; a < keysForDict.length; ++a) {
            const relationstatement = document.createElement('div');
            relationstatement.style.marginLeft = "20px";
            if (a === 1) {
              relationstatement.style.marginTop = "0px";
            }
            else {
              relationstatement.style.marginTop = "30px";
            }
            relationstatement.textContent = `Select the relation to Fragment ${keysForDict[a].substring(1)}`;
            relationstatement.style.fontSize = "18px";
            relationstatement.style.fontWeight = "bold";

            const fuseNext = document.createElement("input");
            fuseNext.type = "submit";
            fuseNext.id = `${index}Fbtn${keysForDict[a]}`;
            // console.log("fusenextid "+fuseNext.id)
            fuseNext.className = "fusebtns";
            fuseNext.value = "Fuse";

            fuseNext.addEventListener("click", () => {
              fuseBondSet.style.display = "block";
              fuseNext.style.display = "none";
              connectNext.style.display = "none";
              relationstatement.style.display = "none";
            });
            if (confirmed === false) {
              fuseNext.style.display = "none";
              relationstatement.style.display = "none";
            }

            const connectNext = document.createElement("input");
            connectNext.type = "submit";
            connectNext.id = `${index}Cbtn${keysForDict[a]}`;
            connectNext.className = "fusebtns";
            connectNext.value = "Connect";

            connectNext.addEventListener("click", () => {
              conBondSet.style.display = "block";
              fuseNext.style.display = "none";
              connectNext.style.display = "none";
              relationstatement.style.display = "none";
            });
            if (confirmed === false) {
              connectNext.style.display = "none";
              relationstatement.style.display = "none";
            }

            const fuseBondSet = document.createElement("div");
            fuseBondSet.style.marginLeft = "18px";
            fuseBondSet.style.marginTop = "10px";
            fuseBondSet.className = "rightDiv";
            fuseBondSet.id = `${i}fusebondset${keysForDict[a]}`;
            fuseBondSet.style.maxWidth = "1000px";
            const pTag = document.createElement("p");
            pTag.innerHTML = `<b style="font-size: 18px;">Fusions to Fragment ${keysForDict[a].substring(1)}: </b>Please enter the bonds to be fused to next molecule.`;
            fuseBondSet.appendChild(pTag);
            fuseBondSet.style.display = "none";
            const maxInputs = molDict[molecule][2];

            const pTag2 = document.createElement("p");
            pTag2.textContent = `Note: Max number of bond fusions possible here: ${maxInputs}. You do not have to give all.`;
            pTag2.style.padding = "0";
            pTag2.style.margin = "0";
            fuseBondSet.appendChild(pTag2);

            const spanner = document.createElement("span");
            spanner.style.display = "flex";

            fuseBondSet.appendChild(spanner);

            const inputStorage = document.createElement("div");
            inputStorage.style.display = "flex";
            inputStorage.style.flexWrap = "wrap";
            fuseBondSet.appendChild(inputStorage);

            const formFuseNext = document.createElement("form");
            formFuseNext.id = "inputForm";

            const input1FN = document.createElement("input");
            input1FN.type = "text";
            input1FN.id = `${i}input1${keysForDict[a]}`;
            input1FN.placeholder = "First bond vertex:";
            input1FN.style.border = "1px solid #ccc";
            input1FN.style.width = "200px";
            input1FN.style.height = "30px";
            input1FN.style.padding = "5px";
            input1FN.style.margin = "10px 10px 0px 0px";
            input1FN.addEventListener("keydown", function (event) {
              handleInput(i, event, "no", `${i}input2${keysForDict[a]}`,`${i}input1${keysForDict[a]}`);
            });

            const input2FN = document.createElement("input");
            input2FN.type = "text";
            input2FN.id = `${i}input2${keysForDict[a]}`;
            input2FN.placeholder = "Second bond vertex:";
            input2FN.style.border = "1px solid #ccc";
            input2FN.style.width = "200px";
            input2FN.style.height = "30px";
            input2FN.style.padding = "5px";
            input2FN.style.margin = "10px 10px 0px 0px";
            input2FN.addEventListener("keydown", function (event) {
              handleInput(i, event, "submit",`${i}input1${keysForDict[a]}`, `${i}input2${keysForDict[a]}`);
            });

            formFuseNext.appendChild(input1FN);
            formFuseNext.appendChild(input2FN);

            inputStorage.appendChild(formFuseNext);

            const inputTag = document.createElement("input");
            inputTag.type = "text";
            inputTag.id = `${i}fusenextinput${keysForDict[a]}`;
            inputTag.style.border = "1px solid #ccc";
            inputTag.style.width = "600px";
            inputTag.style.height = "30px";
            inputTag.style.padding = "5px";
            inputTag.style.margin = "10px 10px 0px 0px";
            inputTag.placeholder = "Expected Format: [ 1 , 2 ] , [ 2 , 3 ] , [ 3 , 4 ]";
            inputTag.pattern = "[d+,d+]";
            // inputTag.readOnly = true;
            inputStorage.appendChild(inputTag);


            const conBondSet = document.createElement("div");
            conBondSet.style.marginLeft = "18px";
            conBondSet.style.marginTop = "10px";
            conBondSet.className = "rightDiv";
            conBondSet.style.maxWidth = "1000px";
            conBondSet.id = `${i}conbondset${keysForDict[a]}`;
            const pTagc = document.createElement("p");
            pTagc.innerHTML = `<b style="font-size: 18px;">Connections to Fragment ${keysForDict[a].substring(1)}:</b> Please enter the atoms to be connected to next molecule.`;
            conBondSet.appendChild(pTagc);
            conBondSet.style.display = "none";

            const pTag2c = document.createElement("p");
            pTag2c.textContent = `Note: Max number of atoms for connections possible here: ${maxInputs}. You do not have to give all.`;
            pTag2c.style.padding = "0";
            pTag2c.style.margin = "0";
            conBondSet.appendChild(pTag2c);

            const spannerc = document.createElement("span");
            spannerc.style.display = "flex";



            conBondSet.appendChild(spannerc);

            const inputStoragec = document.createElement("div");
            inputStoragec.style.display = "flex";
            inputStoragec.style.flexWrap = "wrap";

            conBondSet.appendChild(inputStoragec);

            const formFuseNextc = document.createElement("form");
            formFuseNext.id = "inputForm";

            const input1FNc = document.createElement("input");
            input1FNc.type = "text";
            input1FNc.id = `${i}input1c${keysForDict[a]}`;
            input1FNc.placeholder = "Bond vertex:";
            input1FNc.style.border = "1px solid #ccc";
            input1FNc.style.width = "200px";
            input1FNc.style.height = "30px";
            input1FNc.style.padding = "5px";
            input1FNc.style.margin = "10px 10px 0px 0px";
            input1FNc.addEventListener("keydown", function (event) {
              handleInputc(i, event, "submit", `${i}input1c${keysForDict[a]}`);
            });

            formFuseNextc.appendChild(input1FNc);

            inputStoragec.appendChild(formFuseNextc);

            const inputTag2 = document.createElement("input");
            inputTag2.type = "text";
            inputTag2.id = `${i}connextinput${keysForDict[a]}`;
            inputTag2.style.border = "1px solid #ccc";
            inputTag2.style.padding = "5px";
            inputTag2.style.width = "600px";
            inputTag2.style.height = "30px";
            inputTag2.style.margin = "10px 10px 0px 0px";
            inputTag2.placeholder = "Expected Format: 1, 2, 3, 4, 5";
            inputTag2.pattern = "[0-9]+";
            inputStoragec.appendChild(inputTag2);
            

            // button for confirm fuse
            const fuseConfirm = document.createElement("input");
            fuseConfirm.type = "submit";
            fuseConfirm.className = "fusesubmit";
            fuseConfirm.value = "Confirm Fusions";
            fuseConfirm.id = `${i}fuseconfirmbtn${keysForDict[a]}`;
            fuseBondSet.appendChild(fuseConfirm);

            fuseConfirm.addEventListener("click", () => {
              const inputs = document.getElementById(`${i}fusenextinput${keysForDict[a]}`);
              // const frag = document.getElementById(`${i}fusenextwhere${keysForDict[a]}`).value;
              // console.log(inputs)
              const res = extractSubsets(inputs.value,i);
              if (res.length > 0) {
                res.unshift("fuse");

                generateComponentData(parentDiv.id, keysForDict[a], res);
              }
              else {
                inputs.value = "";
              }
            });


            // button for confirm connect
            const conConfirm = document.createElement("input");
            conConfirm.type = "submit";
            conConfirm.className = "fusesubmit";
            conConfirm.value = "Confirm Connections";
            conConfirm.id  = `${i}conconfirmbtn${keysForDict[a]}`
            conBondSet.appendChild(conConfirm);


            conConfirm.addEventListener("click", () => {
              const inputs = document.getElementById(`${i}connextinput${keysForDict[a]}`);
              const val = inputs.value;
              const numbers = extractUniqueNumbers(val)
              const res = numbers
              if (res.length > 0) {
                res.unshift("connect");
                generateComponentData(parentDiv.id, keysForDict[a], res);
              }
              else {
                inputs.value = "";
              }
            })

            const keys = Object.keys(dataDict)
            console.log("keys " + keys)

            if (confirmed === false) {
              const tempDiv = document.createElement("div");
              tempDiv.textContent = `Please click the "Confirm Molecules" button to be able to start adding the bond connections and fusions.`;
            }
            
            if (confirmed === true) {
              checkerElement.style.display = "block";
              checkerElement.style.overflowX = "hidden";
              document.getElementById("confirmmessage").style.display = "none";
            }

            div2.appendChild(relationstatement);
            div2.appendChild(fuseNext);
            div2.appendChild(connectNext);
            div2.appendChild(fuseBondSet);
            div2.appendChild(conBondSet);
            div2.style.marginBottom = "40px";

            parentDiv.appendChild(div2);
            parentDiv.style.marginBottom = "20px";

            if (confirmed === true && dataDict2[keys[i]][keysForDict[a]].length === 0 && dataDict2[keys[parseInt(keysForDict[a].substring(1))]][`a${i}`][0] === 'fuse') {
              console.log("yoooo");
              document.getElementById(`${i}fusebondset${keysForDict[a]}`).style.display = "block";
              document.getElementById(`${i}fuseconfirmbtn${keysForDict[a]}`).style.display = "block";
              document.getElementById(`${index}Fbtn${keysForDict[a]}`).style.display = "none";
              document.getElementById(`${index}Cbtn${keysForDict[a]}`).style.display = "none";
            }
            else if (confirmed === true && dataDict2[keys[i]][keysForDict[a]].length === 0 && dataDict2[keys[parseInt(keysForDict[a].substring(1))]][`a${i}`][0] === 'connect') {
              console.log("yoooo");
              document.getElementById(`${i}conbondset${keysForDict[a]}`).style.display = "block";
              document.getElementById(`${i}conconfirmbtn${keysForDict[a]}`).style.display = "block";
              document.getElementById(`${index}Fbtn${keysForDict[a]}`).style.display = "none";
              document.getElementById(`${index}Cbtn${keysForDict[a]}`).style.display = "none";
            }

            if (confirmed === true && dataDict2[keys[i]][keysForDict[a]].length > 0 && dataDict2[keys[i]][keysForDict[a]][0] === 'fuse') {
              let arr = dataDict2[keys[i]][keysForDict[a]].slice();
              arr.splice(0, 1);
              // console.log("i: " + keys)
              // console.log(`${i}fusenextinput${keysForDict[a]}`)
              document.getElementById(`${i}fusenextinput${keysForDict[a]}`).value = arr;
              document.getElementById(`${i}fusebondset${keysForDict[a]}`).style.display = "block";
              document.getElementById(`${i}fuseconfirmbtn${keysForDict[a]}`).style.display = "none";
              document.getElementById(`${i}conconfirmbtn${keysForDict[a]}`).style.display = "none";
              document.getElementById(`${index}Fbtn${keysForDict[a]}`).style.display = "none";
              document.getElementById(`${index}Cbtn${keysForDict[a]}`).style.display = "none";
            }

            else if (confirmed === true && dataDict2[keys[i]][keysForDict[a]].length > 0 && dataDict2[keys[i]][keysForDict[a]][0] === 'connect') {
              let arr = dataDict2[keys[i]][keysForDict[a]].slice();
              arr.splice(0, 1);
              // console.log("i: " + keys)
              // console.log("hrrrrrrrr")
              document.getElementById(`${i}connextinput${keysForDict[a]}`).value = arr;
              document.getElementById(`${i}conbondset${keysForDict[a]}`).style.display = "block";
              document.getElementById(`${i}fuseconfirmbtn${keysForDict[a]}`).style.display = "none";
              document.getElementById(`${i}conconfirmbtn${keysForDict[a]}`).style.display = "none";
              document.getElementById(`${index}Fbtn${keysForDict[a]}`).style.display = "none";
              document.getElementById(`${index}Cbtn${keysForDict[a]}`).style.display = "none";
            }

            function handleInput(index, event, submit, nextElementId, prevElementId) {
              if (event.key === "Enter") {
                event.preventDefault();
                if (submit === "submit") {
                  // Call the checkVal function when both inputs are filled and the Enter key is pressed in the second input
                  submitForm(index,nextElementId,prevElementId);
                } else {
                  document.getElementById(nextElementId).focus(); // Shift focus to the next input
                }
              }
            }

            function submitForm(index,nextElementId,prevElementId) {
              const value1 = document.getElementById(nextElementId).value;
              const value2 = document.getElementById(prevElementId).value;
              // console.log(value1,value2)

              // Do something with the values, e.g., call the checkVal function
              checkVal(index, value1, value2, nextElementId, prevElementId);

              // Optionally, you can reset the form after submission
              // formFuseNext.reset();
            }

            function checkVal(index,value1, value2, nextElementId, prevElementId) {

              const keys = Object.keys(dataDict2)
              console.log(maxlen)
              const lengthOfStr = maxlen[dataDict2[keys[index]]['altval']] - 1

              if (nextElementId.includes("input1") || prevElementId.includes("input1")) {
                if (parseInt(value1) <= lengthOfStr && parseInt(value2) <= lengthOfStr) {
                  // console.log("entered")
                  const lenCheck = document.getElementById(`${i}fusenextinput${keysForDict[a]}`).value;
                  if (lenCheck.length === 0) {
                    const val = `[${value1},${value2}]`;
                    document.getElementById(`${i}fusenextinput${keysForDict[a]}`).value = val;
                  } else {
                    const val = document.getElementById(`${i}fusenextinput${keysForDict[a]}`).value + `, [${value1},${value2}]`;
                    document.getElementById(`${i}fusenextinput${keysForDict[a]}`).value = val;
                  }
                  formFuseNext.reset();
                  document.getElementById(nextElementId).focus(); // Shift focus to the next input
                  
                }   
              }

            }

            function handleInputc(index, event, submit,prevElementId) {
              if (event.key === "Enter") {
                event.preventDefault();
                if (submit === "submit") {
                  // Call the checkVal function when both inputs are filled and the Enter key is pressed in the second input
                  submitFormc(index,prevElementId);
                } 
              }
            }
            function submitFormc(index, prevElementId) {
              const value1 = document.getElementById(prevElementId).value;
              // console.log(value1)

              // Do something with the values, e.g., call the checkVal function
              checkVal2(index, value1, prevElementId);

              // Optionally, you can reset the form after submission
              // formFuseNext.reset();
            }
            function checkVal2(index,value1,prevElementId) {

              const keys = Object.keys(dataDict2)
              const lengthOfStr = maxlen[dataDict2[keys[index]]['altval']]
              if (prevElementId === `${i}input1c${keysForDict[a]}`) {
                if (parseInt(value1) <= lengthOfStr) {
                  // console.log("entered")
                  const lenCheck = document.getElementById(`${i}connextinput${keysForDict[a]}`).value;
                  if (lenCheck.length === 0) {
                    const val = `${value1}`;
                    document.getElementById(`${i}connextinput${keysForDict[a]}`).value = val;
                  } else {
                    const val = document.getElementById(`${i}connextinput${keysForDict[a]}`).value + `,${value1}`;
                    document.getElementById(`${i}connextinput${keysForDict[a]}`).value = val;
                  }
                  formFuseNextc.reset();
                  document.getElementById(prevElementId).focus(); // Shift focus to the next input
                    
                  }  
              } 
              
            }            
            
          }
        }

        // showcase.appendChild(divElement);
        // console.log(showcase);
        if (confirmed === true) {
          document.getElementById("item5special").style.display = "block";
        }
      }
    }
  }, [allMolecules, confirmed, dataDict2, moleculeCount]);



  const removeMsg = (val) => {
    const div1 = document.getElementById(val);
    div1.style.boxShadow = "inset 0 2px 10px white";
    const lastChild1 = div1.querySelectorAll("."+val+"p")
    if (lastChild1) {
      lastChild1.forEach((div) => {
        div.remove();
      })
    }
  }



  const closePopup = () => {
    document.getElementById("popup2").style.display = "none";
  };

  const switchStyle = (currId,nextId) => {
    if (currId === "fragment") {
      document.getElementById("imagecollection").style.display = "block";
      document.getElementById("jsmestyle").style.display = "none";
    }
    else if (currId === "drawing") {
      document.getElementById("jsmestyle").style.display = "block";
      document.getElementById("imagecollection").style.display = "none";
    }
  }

  const genmolRelations = () => {
    document.getElementById("loadscreen22").style.display = "block"
    const molmasstot = document.getElementById("molmassid").value;
    const corefragid = document.getElementById("corefragid").value
    const coremol = fragWeights[`Fragment ${corefragid}`]
    const molnumtot1 = document.getElementById("molnumid1").value;
    const molnumtot2 = document.getElementById("molnumid2").value;
    axios.post("/molcombogenerator", {
      params: {
        molmasstot: molmasstot,
        coremol: coremol,
        molnumtot1: molnumtot1,
        molnumtot2: molnumtot2,
      },
      body : JSON.stringify(fragWeights)
    })
    .then (response => {
      document.getElementById("loadscreen22").style.display = "none"
      console.log(response.data);
      setpreProcess(response.data)
    })

  }

  const confirmProcessing = () => {
    const arraystr = document.getElementById("choosecombo").value;
    if (arraystr !== "") {
      console.log(typeof arraystr);
      const itemgroup = document.getElementById("itemsgrouper");
      itemgroup.style.display = "block";
      let actualArr = []
      let finalArr = []
      let tempstr = ""
      for (let i = 0; i < arraystr.length; ++i) {
        if (arraystr[i] !== "-" && arraystr[i] !== " ") {
          tempstr += arraystr[i]
        }
        else {
          actualArr.push(tempstr);
          tempstr = ""
        }
      }
      actualArr.push(tempstr);
      for (let i = 0; i < actualArr.length; ++i) {
        if (!isNaN(parseInt(actualArr[i]))) {
          console.log(parseInt(actualArr[i]))
          finalArr.push(parseInt(actualArr[i]))
        }
      }
      console.log(finalArr);

      const inputdivholder = document.getElementById("groupinputplaceholder");
      inputdivholder.innerHTML = "";
      for (let j = 0; j < finalArr.length; ++j) {
          // Create a div for the subheading
          const inputcarrydiv = document.createElement("div");
          const subheading = document.createElement("p");
          subheading.textContent = `Fragment ${finalArr[j]}`;
          subheading.className = "inputsubheading";
          inputdivholder.appendChild(subheading);

          // Create an input element
          const newmemb = document.createElement("input");
          newmemb.type = "text";
          newmemb.placeholder = `Group for Frag ${j}`;
          newmemb.className = "sec2";

          // Append the input element to the div
          inputcarrydiv.appendChild(subheading);
          inputcarrydiv.appendChild(newmemb);
          inputdivholder.appendChild(inputcarrydiv);
          inputdivholder.style.display = "flex";
          inputdivholder.style.flexWrap = "wrap";
      }
    }
    
  } 

  const groupsConfirmed = () => {
    const groupParent = document.getElementById("groupinputplaceholder").children;
    for (let i = 0; i < groupParent.length; ++i) {
      const arraystr = (groupParent[i].children[1].value);
      let actualArr = []
      let finalArr = []
      let tempstr = ""
      for (let i = 0; i < arraystr.length; ++i) {
        if (arraystr[i] !== "," && arraystr[i] !== " ") {
          tempstr += arraystr[i]
        }
        else {
          actualArr.push(tempstr);
          tempstr = ""
        }
      }
      actualArr.push(tempstr);
      for (let i = 0; i < actualArr.length; ++i) {
        if (!isNaN(parseInt(actualArr[i]))) {
          console.log(parseInt(actualArr[i]))
          finalArr.push(parseInt(actualArr[i]))
        }
      }
      console.log(finalArr);
    }


  }

  return (
    <div class="fade-in">
      <div>
        <Navbar />
      </div>
      <div style={{ display: "flex" }}>
        <SideNavigation />
        <div class="grid-containers" style={{ zoom: "100%" }}>
          <div class="items1">
            <div style={{ paddingBottom: "20px",zoom: "75%" }}>
              <h1>Structure Generation</h1>
            </div>
            <hr />
          </div>
          <div id="items2">
            <div id="is2child1" style={{ zoom: "75%" }}>
              <h4>Step 1:</h4>
              Please select the molecules to be used from the options below.
              Click a molecule to add to combination cart and connect/fuse it to
              other molecules.
              <div style={{clear: "both;"}}></div>
              <input type="button" value="Select Fragment" class="aicall4er" id="fragment" onClick={() => switchStyle("fragment","drawing")} />
              <input type="button" value="Draw Molecule" class="aicall4er" id="drawing" onClick={() => switchStyle("drawing","fragment")} />
            </div>
              <div id="imagecollection" style={{zoom: "75%" }}>
                <div
                  id="moleculeset"
                  style={{ display: "flex", overflowX: "scroll", width: "205vh" }}
                >
                  <div
                    id="d1"
                    class="moleculediv"
                    onClick={() => addToList("C12=CC=CC=C1C=CC=C2")}
                    onMouseEnter={() => clickMsg("d1")}
                    onMouseLeave={() => removeMsg("d1")}
                  >
                    <p
                      style={{
                        marginTop: "20px",
                        textAlign: "center",
                        wordWrap: "break-word",
                        lineHeight: "1.2",
                      }}
                    >
                      C12=CC=CC=C1C=CC=C2
                    </p>
                    <img src={a1} alt="a1" class="imgselector" />
                    <p style={{display: "flex", justifyContent: "center", marginTop: "15px"}}>Fragment 0 : {fragWeights["Fragment 0"].toFixed(2)}</p>
                  </div>
                  <div
                    id="d2"
                    class="moleculediv"
                    onClick={() => addToList("C12=CC=CC([N]C=C3)=C1B3C=C[N]2")}
                    onMouseEnter={() => clickMsg("d2")}
                    onMouseLeave={() => removeMsg("d2")}
                  >
                    <p
                      style={{
                        marginTop: "20px",
                        textAlign: "center",
                        wordWrap: "break-word",
                        lineHeight: "1.2",
                      }}
                    >
                      C12=CC=CC([N]C=C3)<br></br>=C1B3C=C[N]2
                    </p>
                    <img src={a2} alt="a2" class="imgselector2" />
                    <p style={{display: "flex", justifyContent: "center"}}>Fragment 1 : {fragWeights["Fragment 1"].toFixed(2)}</p>
                  </div>
                  <div
                    id="d3"
                    class="moleculediv"
                    onClick={() => addToList("C1(C=CC=C2)=C2OC=C1")}
                    onMouseEnter={() => clickMsg("d3")}
                    onMouseLeave={() => removeMsg("d3")}
                  >
                    <p
                      style={{
                        marginTop: "20px",
                        textAlign: "center",
                        wordWrap: "break-word",
                        lineHeight: "1.2",
                      }}
                    >
                      C1(C=CC=C2)=C2OC=C1
                    </p>
                    <img src={a3} alt="a3" class="imgselector3" />
                    <p style={{display: "flex", justifyContent: "center", marginTop: "23px"}}>Fragment 2 : {fragWeights["Fragment 2"].toFixed(2)}</p>
                  </div>
                  <div
                    id="d4"
                    class="moleculediv"
                    onClick={() =>
                      addToList("C1(C=CC=C2)=C2SC=C1")
                    }
                    onMouseEnter={() => clickMsg("d4")}
                    onMouseLeave={() => removeMsg("d4")}
                  >
                    <p
                      style={{
                        marginTop: "20px",
                        textAlign: "center",
                        lineHeight: "1.2",
                      }}
                    >
                      C1(C=CC=C2)=C2SC=C1
                    </p>
                    <img src={a4} alt="a4" class="imgselector3" />
                    <p style={{display: "flex", justifyContent: "center", marginTop: "22px"}}>Fragment 3 : {fragWeights["Fragment 3"].toFixed(2)}</p>
                  </div>
                  <div
                    id="d5"
                    class="moleculediv"
                    onClick={() => addToList("C12=CC=CC=C1OC3=C2C=CC=C3")}
                    onMouseEnter={() => clickMsg("d5")}
                    onMouseLeave={() => removeMsg("d5")}
                  >
                    <p
                      style={{
                        marginTop: "20px",
                        marginBottom: "20px",
                        textAlign: "center",
                        lineHeight: "1.2",
                      }}
                    >
                      C12=CC=CC=C1OC3=<br></br>C2C=CC=C3
                    </p>
                    <img src={a5} alt="a5" class="imgselectorx2" />
                    <p style={{display: "flex", justifyContent: "center", marginTop: "20px"}}>Fragment 4 : {fragWeights["Fragment 4"].toFixed(2)}</p>
                  </div>
                  <div
                    id="d6"
                    class="moleculediv"
                    onClick={() => addToList("C12=CC=CC=C1SC3=C2C=CC=C3")}
                    onMouseEnter={() => clickMsg("d6")}
                    onMouseLeave={() => removeMsg("d6")}
                  >
                    <p
                      style={{
                        marginTop: "20px",
                        textAlign: "center",
                        lineHeight: "1.2",
                      }}
                    >
                      C12=CC=CC=C1SC3=<br></br>C2C=CC=C3
                    </p>
                    <img src={a6} alt="a6" class="imgselectorx2" />
                    <p style={{display: "flex", justifyContent: "center", marginTop: "40px"}}>Fragment 5 : {fragWeights["Fragment 5"].toFixed(2)}</p>
                  </div>
                  <div
                    id="d7"
                    class="moleculediv"
                    onClick={() => addToList("C1([N]C2=CC=CC=C2)=CC=CC=C1")}
                    onMouseEnter={() => clickMsg("d7")}
                    onMouseLeave={() => removeMsg("d7")}
                  >
                    <p
                      style={{
                        marginTop: "20px",
                        marginBottom: "20px",
                        textAlign: "center",
                        lineHeight: "1.2",
                      }}
                    >
                      C1([N]C2=CC=CC=C2)<br></br>=CC=CC=C1
                    </p>
                    <img src={a7} alt="a7" class="imgselectorx2" />
                    <p style={{display: "flex", justifyContent: "center", marginTop: "20px"}}>Fragment 6 : {fragWeights["Fragment 6"].toFixed(2)}</p>
                  </div>
                </div>
                <input
                  type="button"
                  value="View All"
                  onClick={(event) => viewAllMols(event.target.value)}
                  id="aicaller3"
                />
            </div>

            <div style={{ display: "none" }} id="jsmestyle">
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
                    id="smileintaketemp"
                    value={smiles}
                    onChange={handleChange}
                  />
                </span>
                <span
                  class="iconspan"
                  style={{ paddingTop: "33px" }}
                  onClick={copyToClipboard3}
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
              <div id="checkimg">
                <input type="button" value="Create Fragment" id="createFrag" onClick={generateFragment} />
          
              </div>
          </div>
          </div>

          <div id="items2zz">
            <div id="is2child1" style={{ zoom: "75%" }}>
            <hr style={{marginBottom: "30px"}}></hr>
              <h4>Step 2:</h4>
              Please specify the targetted molecular mass as well as the number of molecules to be used in combination generation.
              <div style={{clear: "both;"}}></div>
              <input type='text' placeholder='Molecular Weight' class="sec1" id="molmassid" />
              <input type='text' placeholder='Core Fragment No.' class="sec1" id="corefragid" style={{marginLeft: "20px"}} />
              <input type='text' placeholder="Molecule No. (LB) (min 2)" class="sec1" id="molnumid1" style={{marginLeft: "20px"}} />
              <input type='text' placeholder="Molecule No. (LB) (max 7)" class="sec1" id="molnumid2" style={{marginLeft: "20px"}} />
              <input type='submit' value="Generate Molecule Relations" class="genmoldt" onClick={genmolRelations} />
            </div>
            <div style={{ display: "none" }} id="loadscreen22">
              <img src={loadLogo} alt="loadalt" id="loadingimg" />
              <p
                style={{
                  textAlign: "center",
                  color: "#f54343",
                  fontSize: "13px",
                }}
              >
                Please wait for the combinations to be generated.
              </p>
            </div>
            <div>
              <p style={{fontSize: "12px", marginTop: "30px"}}>Please select the combination that you would like to use and click <b>"Confirm"</b></p>
              <select id="choosecombo">
                {preProcess && preProcess.map((subarray, index) => (
                  <option key={index} value={subarray.join(' - ')}>{subarray.join(' - ')}</option>
                ))}
              </select>
              <input type='submit' value="Confirm" class="genmoldt22" onClick={confirmProcessing} />
            </div>
          </div>

          <div id="itemsgrouper">
            <div id="is2child1" style={{ zoom: "75%" }}>
            <hr style={{marginBottom: "30px"}}></hr>
              <h4>Step 3:</h4>
              For each of the fragment selected, please specify other fragments from the top list to be grouped with this fragment. If no value is entered for a group, the group for that fragment will only contain the single fragment.
              <div style={{clear: "both;"}}></div>

            </div>
            <div style={{ display: "none" }} id="loadscreen22">
              <img src={loadLogo} alt="loadalt" id="loadingimg" />
              <p
                style={{
                  textAlign: "center",
                  color: "#f54343",
                  fontSize: "13px",
                }}
              >
                Please wait for the combinations to be generated.
              </p>
            </div>
            <div id="groupinputplaceholder" style={{marginTop: "10px"}}>
            
            
            </div>
            <input type='submit' value="Confirm Grouping" className='groupedup' onClick={groupsConfirmed} ></input>
          </div>



          <div id="items3" style={{zoom: "75%"}}>
            <hr></hr>
            <h4 style={{ paddingTop: "30px" }}>Step 2:</h4>
            <div style={{ maxWidth: "1300px" }} id="firstconfirmmsg">
              Click <b>"Confirm Molecules"</b> after the desired molecules have
              been selected. Press on "x" to remove molecules from the set. Note
              that, molecules <b>cannot be added or removed</b> after "Confirm"
              is clicked.
              <br></br>
              {
                allMolecules.length >= 2 && 
                <div id="showcase">
                  Please give the relations between the selected fragments. Note that, a fragment can only connect to the same fragment only once and not at multiple points.
                  <div style={{clear: "both;"}}></div>
                  {allMolecules.length === 2 && 
                  <div id="fragrelations">
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                  </div>
                  }
                  {allMolecules.length === 3 && 
                  <div id="fragrelations">
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                  </div>
                  }
                  {allMolecules.length === 4 && 
                  <div id="fragrelations">
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                  </div>
                  }
                  {allMolecules.length === 5 && 
                  <div id="fragrelations">
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                  </div>
                  }
                  {allMolecules.length === 6 && 
                  <div id="fragrelations">
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                  </div>
                  }
                  {allMolecules.length === 7 && 
                  <div id="fragrelations">
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                      <div style={{display:"flex"}}><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                  </div>
                  }
              <input
                type="submit"
                value="Confirm Molecules & Relations"
                class="confirmmols"
                onClick={confirmMolecules}
              />
                </div>
              }
            </div>
            <div id="secondconfirmmsg" style={{ display: "none" }}>
              Select the bonds between the molecules in chronological order.
              Note that, the first molecule will connect to the second molecule,
              the second to the third, and so on.
            </div>
            <div>
              <div id="checker"></div>
              <div
                id="confirmmessage"
                style={{ marginTop: "20px", fontWeight: "bold" }}
              >
                Please click the "Confirm Molecules" button to be able to start
                adding the bond connections and fusions.
              </div>
            </div>
            <div style={{ display: "flex" }}></div>
            <div id="item5special" style={{ marginBottom: "50px" }}>
              <hr />
              <div style={{ marginTop: "10px", paddingTop: "10px" }}>
                <div>
                  <h4>Step 3:</h4>
                  <div>
                    Please click <b>Generate Combinations</b> to generate the
                    possible molecules formed with the specified fragments.
                  </div>
                </div>
                <input
                  type="submit"
                  value="Generate Combinations"
                  class="callmod"
                  id="callmodel"
                  onClick={generateCombos}
                />
                <div style={{ display: "none" }} id="loadscreen">
                  <img src={loadLogo} alt="loadalt" id="loadingimg" />
                  <p
                    style={{
                      textAlign: "center",
                      color: "#f54343",
                      fontSize: "13px",
                    }}
                  >
                    Please wait for the combinations to be generated.
                  </p>
                </div>
                {combinationData && totalCount && (
                  <div>
                    <div>
                      Total number of combinations generated:{" "}
                      <b>{totalCount} combinations</b>
                    </div>
                    <div>
                      Click <b>Download</b> to download the .csv file containing
                      combinations. Go to the next step to call AI model.
                    </div>
                    <input
                      type="submit"
                      value="Download Combinations"
                      class="callmod"
                      id="aicallstruct"
                      onClick={downloadCsvFile}
                    />
                  </div>
                )}
              </div>
            </div>
            <div id="item4special" style={{ marginBottom: "40px" }}>
              <hr />
              <div style={{ marginTop: "10px", paddingTop: "10px" }}>
                <div>
                  <h4>Step 4:</h4>
                  <div>
                    Please select the AI Model to use for prediction. Click{" "}
                    <b>Predict</b> to start predicting for the combinations
                    generated.
                  </div>
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
                  />
                </span>

                <div
                  style={{ display: "none", marginBottom: "50px" }}
                  id="loadscreen"
                >
                  <img src={loadLogo} alt="loadalt" id="loadingimg" />
                  <p
                    style={{
                      textAlign: "center",
                      color: "#f54343",
                      fontSize: "13px",
                    }}
                  >
                    Please wait for the combinations to be generated.
                  </p>
                </div>
              </div>
            </div>
            <div id="item619">
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
              
              {resultData && (
                <div style={{ paddingTop: "10px" }}>
                  <hr style={{marginBottom: "20px"}} />
                  <h4>Step 5:</h4>
                  <div>
                    Please select range parameters to process and view specific
                    data.
                  </div>
                  <span style={{ display: "inline-block" }}>
                    <form style={{ marginBottom: "30px" }}>
                      <input type="text" id="homomdl" value="Corr. H" disabled />
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

                      <input type="text" id="lumomdl" value="Corr. L" disabled />
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

                    {document.getElementById("modeldropdown").value ===
                        "model2" && 
                    <input type="text" id="s1mdl" value="S1 (Sol.)" disabled />
                    }
                    {document.getElementById("modeldropdown").value !==
                        "model2" && 
                    <input type="text" id="s1mdl" value="S1" disabled />
                    }
                      <input
                        type="text"
                        id="s1lr"
                        defaultValue="0.0"
                        required
                      />
                      <span> ~ </span>
                      <input
                        type="text"
                        id="s1ur"
                        defaultValue="7.0"
                        required
                      />

                      {document.getElementById("modeldropdown").value ===
                        "model1" && (
                        <input type="text" id="s2mdl" value="SI" disabled />
                      )}
                      {document.getElementById("modeldropdown").value !==
                        "model1" && (
                        <input type="text" id="s2mdl" value="TI" disabled />
                      )}

                      <input
                        type="text"
                        id="s2lr"
                        defaultValue="0.0"
                        required
                      />
                      <span> ~ </span>
                      <input
                        type="text"
                        id="s2ur"
                        defaultValue="7.0"
                        required
                      />

                      <span>
                        <br />
                        <input
                          type="submit"
                          name="callAI"
                          value="Get Ranged Data"
                          id="aicaller3"
                          onClick={rangeSetter}
                        />
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
                        {document.getElementById("modeldropdown").value ===
                          "model1" && (
                          <tr>
                            <td className="tableheads5">SMILES</td>
                            <td className="tableheads5">HOMO</td>
                            <td className="tableheads5">Corr.H</td>
                            <td className="tableheads5">LUMO</td>
                            <td className="tableheads5">Corr.L</td>
                            <td className="tableheads5">S1</td>
                            <td className="tableheads5">SI</td>
                          </tr>
                        )}
                        {document.getElementById("modeldropdown").value ===
                          "model2" && (
                          <tr>
                            <td className="tableheads5">SMILES</td>
                            <td className="tableheads5">HOMO</td>
                            <td className="tableheads5">Corr.H</td>
                            <td className="tableheads5">LUMO</td>
                            <td className="tableheads5">Corr.L</td>
                            <td className="tableheads5">S1 (Sol.)</td>
                            <td className="tableheads5">T1</td>
                          </tr>
                        )}
                        {document.getElementById("modeldropdown").value ===
                          "model3" && (
                          <tr>
                            <td className="tableheads5">SMILES</td>
                            <td className="tableheads5">HOMO</td>
                            <td className="tableheads5">Corr.H</td>
                            <td className="tableheads5">LUMO</td>
                            <td className="tableheads5">Corr.L</td>
                            <td className="tableheads5">S1</td>
                            <td className="tableheads5">T1</td>
                          </tr>
                        )}
                        {rangedData.slice(0, 10).map((data, index) => {
                          //need to check if 10 elements exist or not first, cud be less than 10
                          document.getElementById("item619").style.display =
                            "none";
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
                              <td className="internaltabs">
                                {(Math.round(data[5] * 1000) / 1000).toFixed(2)}
                              </td>
                              <td className="internaltabs">
                                {(Math.round(data[6] * 1000) / 1000).toFixed(2)}
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
    </div>
  );
}
