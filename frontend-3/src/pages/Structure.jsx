/* eslint-disable no-loop-func */
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import "./Structure.css"
import SideNavigation from '../components/SideNavigation';

import a1 from "./molecules/1a.png";
import a2 from "./molecules/2a.png";
import a3 from "./molecules/3a.png";
import a4 from "./molecules/4a.png";
import a5 from "./molecules/5a.png";
import a6 from "./molecules/6a.png";
import a7 from "./molecules/7a.png";
import { useSelector, useDispatch } from 'react-redux';
import { falsify, truthify } from '../redux/counter';
import axios from "axios";
import loadLogo from "./loadingani.gif";
import { saveAs } from 'file-saver';
import Papa from "papaparse";
import { MdContentCopy } from "react-icons/md";
import { Jsme } from 'jsme-react';
import { useNavigate } from 'react-router-dom';
import SelectionPopUp from './SelectionPopUp';

export default function Structure() {
  const [datau,setdatau] = useState(`data:image/jpeg;base64,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Lz9fgR07JI9HZl2dVFsrmaZkGFJMjIzoaMnlkiMjQ84ZM9jnD52KAAgAQBsUFRVp6tSpuu2223T//fe3eL5ZW6tAebnMigqZHo8Ml0tGUpIcF1wgIyamEzoGTkcABACglbZv365Ro0ZpwoQJeuWVV+RwMEqP8EQABACgFQ4dOqSsrCz17NlTJSUlOuuss6xuCWi3IK1ZBwCg+/J4PLrmmmtUW1urNWvWEP4Q9giAAAA0wzRN/fznP9emTZu0evVqnXvuuVa3BHQYARAAgGYsWLBAeXl5ys/P16hRo6xuBwgKZgABADiDpUuXKjc3V3fccYfuvfdeq9sBgoYACABAE7Zt26bRo0dr0qRJeumll1jxi26FAAgAwNccPHhQmZmZSkxMVHFxsWJjY61uCQgq/joDAMBX1NfX6+qrr5bX69XSpUsJf+iWWAQCAMBJpmnqxhtv1NatW7VmzRr169fP6paAkCAAAgBw0v3336/8/Hz99a9/VWZmptXtACHDI2AAACS98soruuOOO3TXXXdp+vTpVrcDhBSLQAAAtrd161ZlZ2drypQpeuGFF1jxi26PAAgAsLX9+/crMzNTKSkpWrt2rWJiYqxuCQg5/ooDALCturo65ebmKhAIqLCwkPAH22ARCADAlkzT1M9+9jN98MEHWrt2rfr27Wt1S0CnIQACAGzpvvvu01//+le9+OKLuuSSS6xuB+hUPAIGANjO3//+d82bN0/33HOPrr32WqvbATodi0AAALayefNmjR07Vjk5OXr++edlGIbVLQGdjgAIALANt9utESNGqF+/fnrnnXcUHR1tdUuAJQiAAABbqK2t1bhx43TgwAFt3LhRffr0sbolwDIsAgEAdHuBQEA//vGP9dFHH6mkpITwB9sjAAIAur177rlHL730kl5++WUNHz7c6nYAy7EKGADQrb3wwgu6++67dd999+maa66xuh2gS2AGEADQbW3cuFHjxo3TtGnT9Oyzz7LiFziJAAgA6JY+//xzjRgxQgMGDNDq1asVFRVldUtAl0EABAB0OzU1NRo7dqwqKir03nvvKSUlxeqWgC6FRSAAgG4lEAho5syZ+vjjj7Vu3TrCH9AEAiAAoFv53e9+p1deeUUFBQW68MILrW4H6JIIgACAbuP555/XvffeqwceeEBTp061uh2gy2IGEADQLWzYsEHf+c53NH36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`)
  const [allMolecules,setAllMolecules] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
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

  const [molDict,setMolDict] = React.useState ({
    "C12=CC=CC=C1C=CC=C2" : [a1,'a1', 10],
    "C12=CC=CC([N]C=C3)=C1B3C=C[N]2" : [a2,'a2', 13],
    "C1(C=CC=C2)=C2OC=C1" : [a3,'a3', 9],
    "C1(C=CC=C2)=C2SC=C1" : [a4,'a4', 9],
    "C12=CC=CC=C1OC3=C2C=CC=C3" : [a5,'a5', 13],
    "C12=CC=CC=C1SC3=C2C=CC=C3" : [a6,'a6', 13],
    "C1([N]C2=CC=CC=C2)=CC=CC=C1" : [a7,'a7', 13]
  })

  const [molGroups,setMolGroups] = React.useState([]);

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
    "Fragment 0" : 128.06,
    "Fragment 1" : 166.07,
    "Fragment 2" : 118.04,
    "Fragment 3" : 134.02,
    "Fragment 4" : 168.06,
    "Fragment 5" : 184.03,
    "Fragment 6" : 168.08
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
    p.style.margin = "4px 0px 0px 60px";
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
    // if (confirmed === false) {
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
    // }
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
    console.log("allmolecules = ")
    console.log(allMolecules);
    const dictToAdd = {};
    const dictToAdd2 = {}
    const tempElement = document.getElementById("checker");
    const imgTags = tempElement.getElementsByTagName("img");
    var childrenOfChecker = tempElement.getElementsByClassName("moleculeDivs");
    console.log(childrenOfChecker);

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
      // document.getElementById("firstconfirmmsg").style.display = "none";
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
    const backendURL = process.env.REACT_APP_BACKEND_IP4;
    console.log(backendURL)
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
    axios.post(`http://10.101.100.27:10000/preparecombos`, {
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
      // addToList(coresmile);
      // console.log(molDict)
      // console.log(maxlen)
      const fragweightkeys = Object.keys(fragWeights);
      const newidx = fragweightkeys.length;
      console.log(`Fragment ${newidx}`)
      setfragWeights(prevweights => ({
        ...prevweights,
        [`Fragment ${newidx}`]:parseFloat(res.data.molmass)
      }))
    })
  }

  useEffect(() => {
    console.log(dataDict2);
    var maxlenkeys = Object.keys(maxlen);
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
        // if (molDict[molecule][1] === 'a1') {
        //   imgElement.id = "speciala"
        // }
        // else if (parseInt(molDict[molecule][1].substring(1)) < 7) {
        //   imgElement.id = 'a69';
        // }
        // else if (molDict[molecule][1] === 'a5' || molDict[molecule][1] === 'a6' || molDict[molecule][1] === 'a6' || molDict[molecule][1] === 'a7') {
        //   imgElement.id = "speciala2"
        // }
        // else if (parseInt(molDict[molecule][1].substring(1)) < 10) {
        //   imgElement.id = 'a6';
        // }
        // else {
        //   imgElement.id = 'a100';
        // } 
        imgElement.id = "a69"
        // imgElement.id = molDict[molecule][1];
        imgElement.className = "themolImage";

        const fragfromlist = maxlenkeys.indexOf(molecule);
        const pElement = document.createElement("p");
        pElement.style.width = "100%";
        pElement.style.whiteSpace = "nowrap";
        pElement.style.overflow = "hidden";
        pElement.style.fontSize = "15px";
        pElement.style.textAlign = "center";
        pElement.textContent = 'MW:' + fragWeights[`Fragment ${fragfromlist}`]

        // divElement.appendChild(crossElement);
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
                  submitForm(index,nextElementId,prevElementId);
                } else {
                  document.getElementById(nextElementId).focus(); // Shift focus to the next input
                }
              }
            }

            function submitForm(index,nextElementId,prevElementId) {
              const value1 = document.getElementById(nextElementId).value;
              const value2 = document.getElementById(prevElementId).value;
              checkVal(index, value1, value2, nextElementId, prevElementId);
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
                  submitFormc(index,prevElementId);
                } 
              }
            }
            function submitFormc(index, prevElementId) {
              const value1 = document.getElementById(prevElementId).value;
              checkVal2(index, value1, prevElementId);
            }
            function checkVal2(index,value1,prevElementId) {

              const keys = Object.keys(dataDict2)
              const lengthOfStr = maxlen[dataDict2[keys[index]]['altval']]
              if (prevElementId === `${i}input1c${keysForDict[a]}`) {
                if (parseInt(value1) <= lengthOfStr) {
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
    console.log(document.getElementById("drawing").value)
    if (document.getElementById("drawing").value === "Draw Fragment") {
      document.getElementById("imagecollection11").style.display = "block";
      document.getElementById("jsmestyle1").style.display = "block";
      document.getElementById("drawing").value = "Hide";
    }
    else if (document.getElementById("drawing").value === "Hide") {
      document.getElementById("jsmestyle1").style.display = "none";
      document.getElementById("imagecollection11").style.display = "block";
      document.getElementById("drawing").value = "Draw Fragment";
    }
  }

  const genmolRelations = () => {
    document.getElementById("loadscreen22").style.display = "block"
    const molmasstot = document.getElementById("molmassid").value;
    console.log(molGroups)
    const weightlist = []
    for (let i = 0; i < molGroups.length; ++i) {
      let tempGr = []
      for (let j = 0; j < molGroups[i].length; ++j) {
        console.log(molGroups[i][j])
        tempGr.push(fragWeights[`Fragment ${molGroups[i][j]}`])
      }
      weightlist.push(tempGr);
    }
    console.log(weightlist);
    axios.post("/molcombogenerator", {
      params: {
        molmasstot: molmasstot,
      },
      body : {weightlist: JSON.stringify(weightlist),
              fragWeights: JSON.stringify(fragWeights)}
    })
    .then (response => {
      document.getElementById("loadscreen22").style.display = "none"
      console.log(response.data);
      setpreProcess(response.data)
      // console.log()
    })

  }

  const clearPrevious = () => {
    setMoleculeCount(-1);
    setAllMolecules([]);
    setAddStatus(false);
    setConfirmed(false);
    document.getElementById("clearselectprompt").style.display = "none";
    document.getElementById("dropdownlistprompt").style.display = "block";
  }

  const confirmProcessing = () => {
    const arraystr = document.getElementById("choosecombo").value;
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
    console.log("finalArr = ");
    console.log(finalArr);
    const keysSmiles = Object.keys(maxlen)
    console.log(keysSmiles)
    for (let j = 0; j < finalArr.length; ++j) {
      console.log(keysSmiles[finalArr[j]])
      autoAddToList(keysSmiles[finalArr[j]],j)
    }

    document.getElementById("dropdownlistprompt").style.display = "none";
    document.getElementById("clearselectprompt").style.display = "block"
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

  const popUpClick = (val) => {
    console.log(val);
    const mainid = document.getElementById(val.substring(0,3)+"plus");
    if (mainid.value === "+") {
      document.getElementById("drawbingo").style.display = "block"
      document.getElementById("gr0plus").value = "+";
      document.getElementById("gr1plus").value = "+";
      document.getElementById("gr2plus").value = "+";
      document.getElementById("gr3plus").value = "+";
      document.getElementById("gr4plus").value = "+";
      document.getElementById("gr5plus").value = "+";
      document.getElementById("gr6plus").value = "+";
      document.getElementById("gr0div").style.display = "none";
      document.getElementById("gr1div").style.display = "none";
      document.getElementById("gr2div").style.display = "none";
      document.getElementById("gr3div").style.display = "none";
      document.getElementById("gr4div").style.display = "none";
      document.getElementById("gr5div").style.display = "none";
      document.getElementById("gr6div").style.display = "none";
      setTimeout(() => {
        mainid.value = "✓";
        document.getElementById(val.substring(0,3)+"div").style.display = "block";
      }, 200); // Set the duration for the div visibility

    }
    else if (mainid.value === "✓") {
      document.getElementById("drawbingo").style.display = "none"
      mainid.value = "+";
      document.getElementById("gr0div").style.display = "none";
      document.getElementById("gr1div").style.display = "none";
      document.getElementById("gr2div").style.display = "none";
      document.getElementById("gr3div").style.display = "none";
      document.getElementById("gr4div").style.display = "none";
      document.getElementById("gr5div").style.display = "none";
      document.getElementById("gr6div").style.display = "none";
    }
    return
  }

  const addToGroup = (idd,id,val) => {
    console.log(id)

    const div1 = document.getElementById(idd);
    console.log(div1)
    div1.style.boxShadow = "inset 0 2px 10px green";
    setTimeout(function() {
      div1.style.boxShadow = "inset 0 2px 10px white";
    },300)
    const elem = document.getElementById(id);
    if (id === "gr0val" && elem.value.length < 3) {
      if (elem.value.includes(val) === false) {
        elem.value += val;
        elem.value += ", ";
      }
      console.log(elem.value.length)
    }
    if (id !== "gr0val") {
      if (elem.value.includes(val) === false) {
        elem.value += val;
        elem.value += ", ";
      }
      console.log(elem.value.length)
    }

  }

  const groupConfirmer = () => {
    const groupArr = []
    const gr0 = document.getElementById("gr0val").value;
    if (gr0.length > 0) {
      let actualArr = []
      let finalArr = []
      let tempstr = ""
      for (let i = 0; i < gr0.length; ++i) {
        if (gr0[i] !== "-" && gr0[i] !== " ") {
          tempstr += gr0[i]
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
      groupArr.push(finalArr);
      console.log(groupArr)
    }

    const gr1 = document.getElementById("gr1val").value;
    if (gr1.length > 0) {
      let actualArr = []
      let finalArr = []
      let tempstr = ""
      for (let i = 0; i < gr1.length; ++i) {
        if (gr1[i] !== "-" && gr1[i] !== " ") {
          tempstr += gr1[i]
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
      groupArr.push(finalArr);
      console.log(groupArr)
    }
    const gr2 = document.getElementById("gr2val").value;
    if (gr2.length > 0) {
      let actualArr = []
      let finalArr = []
      let tempstr = ""
      for (let i = 0; i < gr2.length; ++i) {
        if (gr2[i] !== "-" && gr2[i] !== " ") {
          tempstr += gr2[i]
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
      groupArr.push(finalArr);
      console.log(groupArr)
    }
    const gr3 = document.getElementById("gr3val").value;
    if (gr3.length > 0) {
      let actualArr = []
      let finalArr = []
      let tempstr = ""
      for (let i = 0; i < gr3.length; ++i) {
        if (gr3[i] !== "-" && gr3[i] !== " ") {
          tempstr += gr3[i]
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
      groupArr.push(finalArr);
      console.log(groupArr)
    }
    const gr4 = document.getElementById("gr4val").value;
    if (gr4.length > 0) {
      let actualArr = []
      let finalArr = []
      let tempstr = ""
      for (let i = 0; i < gr4.length; ++i) {
        if (gr4[i] !== "-" && gr4[i] !== " ") {
          tempstr += gr4[i]
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
      groupArr.push(finalArr);
      console.log(groupArr)
    }
    const gr5 = document.getElementById("gr5val").value;
    if (gr5.length > 0) {
      let actualArr = []
      let finalArr = []
      let tempstr = ""
      for (let i = 0; i < gr5.length; ++i) {
        if (gr5[i] !== "-" && gr5[i] !== " ") {
          tempstr += gr5[i]
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
      groupArr.push(finalArr);
      console.log(groupArr)
    }
    const gr6 = document.getElementById("gr6val").value;
    if (gr6.length > 0) {
      let actualArr = []
      let finalArr = []
      let tempstr = ""
      for (let i = 0; i < gr6.length; ++i) {
        if (gr5[i] !== "-" && gr6[i] !== " ") {
          tempstr += gr6[i]
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
      groupArr.push(finalArr);
      console.log(groupArr)
    }
    setMolGroups(groupArr);

  }
  const fakeconfirm = () => {
    // document.getElementById("fakeconfirm").style.display = "none";
    const relationchildren = document.getElementById("fragrelations");
    const divs = relationchildren.querySelectorAll('div');
    const username = localStorage.getItem('username');
    var callapi = true;
    console.log(username)
    let arraysend = []
    divs.forEach((div) => {
      const input1 = div.querySelector('input:nth-of-type(1)');
      const input2 = div.querySelector('input:nth-of-type(2)');

      // console.log(input1.value.length);
      // console.log(input2.value.length);
      if (input1.value.length > 0 && input2.value.length > 0) {
        // console.log('Input 1:', input1.value);
        // console.log('Input 2:', input2.value);
        const i1 = input1.value;
        const i2 = input2.value;
        console.log("bonds")
        // console.log(i1)
        // console.log(i2)
        const tem1 = parseInt(i1)
        const tem2 = parseInt(i2)
        if (tem1 > molGroups.length - 1) {
          document.getElementById("secretsanta").style.display = "block";
          setTimeout(() => {
            document.getElementById("secretsanta").style.display = "none";
          }, 1000);
          callapi = false;
        }
        else if (tem2 > molGroups.length - 1) {
          document.getElementById("secretsanta").style.display = "block";
          setTimeout(() => {
            document.getElementById("secretsanta").style.display = "none";
          }, 1000);
          callapi = false;
        }
        else {
          arraysend.push(i1,i2)
        }
      }
    });
    console.log(arraysend);
    if (callapi === true) {
      const backendURL = process.env.REACT_APP_BACKEND_IP;
      axios.post(`${backendURL}/getvisuals`, {
  
        username: username,
        body: arraysend
      })
      .then(
        response => {
          const url = `data:image/jpeg;base64,${response.data}`;
          const imgele = document.createElement('img');
          imgele.src = url;
          imgele.style.width = "500px";
          imgele.style.height = "350px";
          // imgele.style.border = 
          imgele.style.marginTop= "-40px";
          document.getElementById('storebingo').innerHTML = "";
          document.getElementById('storebingo').append(imgele);
        }
      )
    }
  }

  const removeClickVal = (val) => {
    let inputval = document.getElementById(val).value;
    inputval = inputval.substring(0,inputval.length-3);
    document.getElementById(val).value = inputval;
  }
  

  const keysMolDict = Object.keys(molDict);
  let indxxx = 1; // Initialize index for IDs
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
              <div id="imagecollection" style={{zoom: "75%", display: "none" }}>
                <div
                  id="moleculeset"
                  style={{ display: "flex", flexWrap:"wrap", overflowY:"scroll", width: "200vh", height: "45vh" }}
                >
                  {Object.entries(molDict).map(([mol, [imgSrc, imgAlt, weight]]) => {
                    const id = `d${indxxx}`;
                    const fragmentKey = `Fragment ${indxxx-1}`;
                    indxxx++; // Increment index for the next iteration
                    

                    return (
                      <div
                        key={mol}
                        id={id}
                        className="moleculediv"
                        onClick={() => addToList(mol)}
                        onMouseEnter={() => clickMsg(id)}
                        onMouseLeave={() => removeMsg(id)}
                      >
                        <p
                          style={{
                            marginTop: "20px",
                            textAlign: "center",
                            wordWrap: "break-word",
                            lineHeight: "1.2",
                          }}
                        >
                          
                        </p>
                        {fragmentKey === "Fragment 0" && 
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselector" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "15px"}}>MW : {fragWeights[fragmentKey].toFixed(2)}</p>
                          </div>
                          
                        }
                        {fragmentKey === "Fragment 1" &&
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselector2" />
                            <p style={{display: "flex", justifyContent: "center"}}>MW : {fragWeights[fragmentKey].toFixed(2)}</p>
                          </div>
                          
                        }
                        {fragmentKey === "Fragment 2" && 
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselector3" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "23px"}}>MW : {fragWeights[fragmentKey].toFixed(2)}</p>
                          </div>
                        }
                        {fragmentKey === "Fragment 3" && 
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselector3" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "22px"}}>MW : {fragWeights[fragmentKey].toFixed(2)}</p>
                          </div> 
                        }
                        {fragmentKey === "Fragment 4" && 
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselectorx2" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "36px"}}>MW : {fragWeights[fragmentKey].toFixed(2)}</p>
                          </div>
                          
                        }
                        {fragmentKey === "Fragment 5" && 
                        <div>
                          <img src={imgSrc} alt={imgAlt} className="imgselectorx2" />
                          <p style={{display: "flex", justifyContent: "center", marginTop: "55px"}}>MW : {fragWeights[fragmentKey].toFixed(2)}</p>
                        </div>
                        }
                        {fragmentKey === "Fragment 6" && 
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselectorx2" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "36px"}}>MW : {fragWeights[fragmentKey].toFixed(2)}</p>
                          </div>

                        }
                        {fragmentKey !== "Fragment 0" && fragmentKey !== "Fragment 1" && fragmentKey !== "Fragment 2" && fragmentKey !== "Fragment 3" && fragmentKey !== "Fragment 4" && fragmentKey !== "Fragment 5" && fragmentKey !== "Fragment 6" && 
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselectorspec" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "20px"}}>MW : {fragWeights[fragmentKey]}</p>
                          </div>
                        }

                      
                      </div>
                    );
                  })}

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

          <div id="item3zz">
            <div id="is2child1" style={{ zoom: "75%" }}>
            
              <h4>Step 1:</h4>
              Please specify the groups for the fragments used in the combinations. Click on the <b>"+"</b> to add new fragments to each group. You do not have to fill every group.
              <div style={{clear: "both;"}}></div>
              <div style={{display: "flex", flexWrap: "wrap"}}>
                <div id="gr0" style={{display: "flex"}}>
                  <div style={{display: "flex"}}>
                    <p style={{marginTop: "30px", marginRight: "5px"}}>Group 0</p>
                    <input type='text' placeholder='Frag.' class="sec1" id="gr0val" disabled />
                  </div>
                  <div>
                    <input type='submit' value="-" class="secb" onClick={()=>{removeClickVal('gr0val')}} />
                    <input type='submit' id="gr0plus" value="+" class="secm" onClick={()=>{popUpClick('gr0val')}} />
                  </div>
                </div>
                <div id="gr1" style={{display: "flex"}}>
                <div style={{display: "flex"}}>
                    <p style={{marginTop: "30px", marginRight: "5px"}}>Group 1</p>
                    <input type='text' placeholder='Frag.' class="sec1" id="gr1val" disabled />
                  </div>
                  <div>
                    <input type='submit' value="-" class="secb" onClick={()=>{removeClickVal('gr1val')}} />
                    <input type='submit' id="gr1plus"  value="+" class="secm" onClick={()=>{popUpClick('gr1val')}} />
                  </div>  
                </div>
                <div id="gr2" style={{display: "flex"}}>
                <div style={{display: "flex"}}>
                    <p style={{marginTop: "30px", marginRight: "5px"}}>Group 2</p>
                    <input type='text' placeholder='Frag.' class="sec1" id="gr2val" disabled />
                  </div>
                  <div>
                    <input type='submit' value="-" class="secb" onClick={()=>{removeClickVal('gr2val')}} />
                    <input type='submit' id="gr2plus"  value="+" class="secm" onClick={()=>{popUpClick('gr2val')}} />
                  </div>
                </div>
                <div id="gr3" style={{display: "flex"}}>
                <div style={{display: "flex"}}>
                    <p style={{marginTop: "30px", marginRight: "5px"}}>Group 3</p>
                    <input type='text' placeholder='Frag.' class="sec1" id="gr3val" disabled />
                  </div>
                  <div>
                    <input type='submit' value="-" class="secb" onClick={()=>{removeClickVal('gr3val')}} />
                    <input type='submit' id="gr3plus"  value="+" class="secm" onClick={()=>{popUpClick('gr3val')}} />
                  </div>
                </div>
                <div id="gr4" style={{display: "flex"}}>
                <div style={{display: "flex"}}>
                    <p style={{marginTop: "30px", marginRight: "5px"}}>Group 4</p>
                    <input type='text' placeholder='Frag.' class="sec1" id="gr4val" disabled />
                  </div>
                  <div>
                    <input type='submit' value="-" class="secb" onClick={()=>{removeClickVal('gr4val')}} />
                    <input type='submit' id="gr4plus"  value="+" class="secm" onClick={()=>{popUpClick('gr4val')}} />
                  </div>
                </div>
                <div id="gr5" style={{display: "flex"}}>
                <div style={{display: "flex"}}>
                    <p style={{marginTop: "30px", marginRight: "5px"}}>Group 5</p>
                    <input type='text' placeholder='Frag.' class="sec1" id="gr5val" disabled />
                  </div>
                  <div>
                    <input type='submit' value="-" class="secb" onClick={()=>{removeClickVal('gr5val')}} />
                    <input type='submit' id="gr5plus"  value="+" class="secm" onClick={()=>{popUpClick('gr5val')}} />
                  </div>
                </div>
                <div id="gr6" style={{display: "flex"}}>
                <div style={{display: "flex"}}>
                    <p style={{marginTop: "30px", marginRight: "5px"}}>Group 6</p>
                    <input type='text' placeholder='Frag.' class="sec1" id="gr6val" disabled />
                  </div>
                  <div>
                    <input type='submit' value="-" class="secb" onClick={()=>{removeClickVal('gr6val')}} />
                    <input type='submit' id="gr6plus"  value="+" class="secm" onClick={()=>{popUpClick('gr6val')}} />
                  </div>
                </div>
              </div>
              
              <div style={{marginTop: "20px", display: "none"}} id="drawbingo">
                <p>Click below to draw new molecules to be added to the list.</p>
                <input style={{marginLeft: "0px",marginTop: "0px"}}type="button" value="Draw Fragment" class="aicall4er" id="drawing" onClick={() => switchStyle("drawing","fragment")} />
              </div>
              
            </div>
            <div id="gr0div" style={{display: "none"}}>
              <SelectionPopUp molDict={molDict} indxxx={indxxx} addToList={addToGroup} fragWeights={fragWeights} clickMsg={clickMsg} removeMsg={removeMsg} idname={"gr0val"} Jsme={Jsme} loading={loading} logSmiles={logSmiles} smiles={smiles} handleChange={handleChange} copyToClipboard3={copyToClipboard3} MdContentCopy={MdContentCopy} generateFragment={generateFragment} switchStyle={switchStyle} />
            </div>
            <div id="gr1div" style={{display: "none"}}>
              <SelectionPopUp molDict={molDict} indxxx={indxxx} addToList={addToGroup} fragWeights={fragWeights} clickMsg={clickMsg} removeMsg={removeMsg} idname={"gr1val"} Jsme={Jsme} loading={loading} logSmiles={logSmiles} smiles={smiles} handleChange={handleChange} copyToClipboard3={copyToClipboard3} MdContentCopy={MdContentCopy} generateFragment={generateFragment} switchStyle={switchStyle} />  
            </div>
            <div id="gr2div" style={{display: "none"}}>
              <SelectionPopUp molDict={molDict} indxxx={indxxx} addToList={addToGroup} fragWeights={fragWeights} clickMsg={clickMsg} removeMsg={removeMsg} idname={"gr2val"} Jsme={Jsme} loading={loading} logSmiles={logSmiles} smiles={smiles} handleChange={handleChange} copyToClipboard3={copyToClipboard3} MdContentCopy={MdContentCopy} generateFragment={generateFragment} switchStyle={switchStyle} />
            </div>
            <div id="gr3div" style={{display: "none"}}>
              <SelectionPopUp molDict={molDict} indxxx={indxxx} addToList={addToGroup} fragWeights={fragWeights} clickMsg={clickMsg} removeMsg={removeMsg} idname={"gr3val"} Jsme={Jsme} loading={loading} logSmiles={logSmiles} smiles={smiles} handleChange={handleChange} copyToClipboard3={copyToClipboard3} MdContentCopy={MdContentCopy} generateFragment={generateFragment} switchStyle={switchStyle} />
            </div>
            <div id="gr4div" style={{display: "none"}}>
              <SelectionPopUp molDict={molDict} indxxx={indxxx} addToList={addToGroup} fragWeights={fragWeights} clickMsg={clickMsg} removeMsg={removeMsg} idname={"gr4val"} Jsme={Jsme} loading={loading} logSmiles={logSmiles} smiles={smiles} handleChange={handleChange} copyToClipboard3={copyToClipboard3} MdContentCopy={MdContentCopy} generateFragment={generateFragment} switchStyle={switchStyle} />
            </div>
            <div id="gr5div" style={{display: "none"}}>
              <SelectionPopUp molDict={molDict} indxxx={indxxx} addToList={addToGroup} fragWeights={fragWeights} clickMsg={clickMsg} removeMsg={removeMsg} idname={"gr5val"} Jsme={Jsme} loading={loading} logSmiles={logSmiles} smiles={smiles} handleChange={handleChange} copyToClipboard3={copyToClipboard3} MdContentCopy={MdContentCopy} generateFragment={generateFragment} switchStyle={switchStyle} />
            </div>
            <div id="gr6div" style={{display: "none"}}>
              <SelectionPopUp molDict={molDict} indxxx={indxxx} addToList={addToGroup} fragWeights={fragWeights} clickMsg={clickMsg} removeMsg={removeMsg} idname={"gr6val"} Jsme={Jsme} loading={loading} logSmiles={logSmiles} smiles={smiles} handleChange={handleChange} copyToClipboard3={copyToClipboard3} MdContentCopy={MdContentCopy} generateFragment={generateFragment} switchStyle={switchStyle} />
            </div> 
            <div>
            <div style={{ display: "none", marginTop: "30px" }} id="jsmestyle1">
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
            <input type='submit' value="Confirm Groups" id="groupconfirmer" onClick={groupConfirmer}></input>
          </div>
        
          <div id="itemfrag" style={{zoom: "75%"}}>
          <hr style={{marginBottom: "0px"}}></hr>
            <h4 style={{ paddingTop: "30px" }}>Step 2:</h4>
            
              <div style={{ maxWidth: "1300px" }} id="firstconfirmmsg">
                Click <b>"Confirm Fragments & Relations"</b> after the desired molecules have
                been selected. 
                <div>Please give the relations between the selected fragments. Note that a fragment can only connect to the same fragment only once and not at multiple points.</div>
                <br></br>
                <div style={{display: "flex"}}>
                {
                  molGroups.length >= 2 && 
                  <div id="showcase">
                    
                    
                    {molGroups.length === 2 && 
                    <div id="fragrelations">
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                    </div>
                    }
                    {molGroups.length === 3 && 
                    <div id="fragrelations">
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                    </div>
                    }
                    {molGroups.length === 4 && 
                    <div id="fragrelations">
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                    </div>
                    }
                    {molGroups.length === 5 && 
                    <div id="fragrelations">
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                    </div>
                    }
                    {molGroups.length === 6 && 
                    <div id="fragrelations">
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                    </div>
                    }
                    {molGroups.length === 7 && 
                    <div id="fragrelations">
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                        <div style={{display:"flex"}}><p style={{marginTop: "13px", marginRight: "7px"}}>Group No:</p><input type='text' placeholder='Fragment' className='fragforms' /><p style={{padding: "10px"}}>-</p><input type='text' placeholder='Fragment' className='fragforms'  /></div>
                    </div>
                    }
                    <input
                      type="submit"
                      value="Confirm Fragments & Relations"
                      class="confirmmols"
                      onClick={fakeconfirm}
                      id="fakeconfirm"
                    />
                    <div id="secretsanta" style={{marginLeft: "80px", marginTop: "10px", color: "#f54343", display: "none"}}>Incorrect Fragment Relations</div>
                </div>
                }
                  <div id="storebingo"></div>
                </div>
              </div>
              
            
            
          </div>
          <div id="items2zz">
            <div id="is2child1" style={{ zoom: "75%" }}>
            <hr style={{marginBottom: "30px"}}></hr>
              <h4>Step 4:</h4>
              Please specify the targetted molecular mass as well as the number of molecules to be used in combination generation.
              <div style={{clear: "both;"}}></div>
              <input type='text' placeholder='Molecular Weight' class="secxxx" id="molmassid" />
              <input type='submit' value="Filter" class="genmoldt" onClick={genmolRelations} />
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
            <div id="clearselectprompt" style={{display: "none"}}>
                <p style={{fontSize: "12px", marginTop: "20px"}}>Click <b>"Clear Selection"</b> to clear this set of molecules and select from the dropdown list again.</p>
                <input type='submit' value="Clear Selection" class='secpa' onClick={clearPrevious} />  
            </div>
            <div id="dropdownlistprompt">
              <p style={{fontSize: "12px", marginTop: "20px"}}>Please select the <b>combination of fragments</b> that you would like to use and click <b>"Confirm"</b></p>
              <p id="groupnames" style={{fontSize: "13px",marginTop: "10px"}}>
                {preProcess && preProcess.length > 0 && (
                  <span style={{fontWeight: "bold"}}>
                    <b>Groups Order:</b> {preProcess[0].map((_, index) => index).join(' , ')}
                  </span>
                )}
              </p>
              <span style={{fontSize: "13px", marginRight: "10px", fontWeight: "bold"}}>Fragments:</span>
              <select id="choosecombo">
                {preProcess && preProcess.map((subarray, index) => (
                  <option key={index} value={subarray.join(' , ')}>{subarray.join(' , ')}</option>
                ))}
              </select>
              <input type='submit' value="Confirm" class="genmoldt22" onClick={confirmProcessing} />
            </div>
          </div>

          <div id="items3" style={{zoom: "75%"}}>
            <hr style={{marginBottom: "30px", marginLeft: "-8px"}}></hr>
            <h4>Step 5:</h4>
            <div>
                <p>
                  Click <b>"Enter Combination Data"</b> to start entering the molecule connections.
                </p>
                <input type='submit' value="Enter Connection Details" class='secma' style={{width: "240px"}} onClick={confirmMolecules} />
            </div>
            
          <div id="itemsgrouper">
            <div id="is2child1">
            <hr style={{marginBottom: "30px"}}></hr>
              <h4>Step 5:</h4>
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
                  <h4>Step 3:</h4>
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
