import React from 'react';
import { Jsme } from 'jsme-react';


export default function SelectionPopUp( {molDict,indxxx, addToList,clickMsg,removeMsg,fragWeights, idname,Jsme,loading,logSmiles,smiles,handleChange,copyToClipboard3,MdContentCopy,generateFragment, switchStyle} ) {
    indxxx = 1;
    return (  
      <div>
            <div id="imagecollection11" style={{zoom: "75%", marginLeft: "0px", marginTop: "20px", border: "1px solid rgb(204, 204, 204)"}}>
                <div style={{marginLeft: "20px", marginTop: "20px"}}>Select fragments for Group {idname.substring(2,3)}. Then click on <b style={{fontSize: "20px"}}>✓</b> beside Group {idname.substring(2,3)} to confirm group.</div>            
                <div
                  id="moleculeset"
                  style={{ display: "flex", flexWrap:"wrap", overflowY:"scroll", width: "200vh", height: "45vh" }}
                >
                  {Object.entries(molDict).map(([mol, [imgSrc, imgAlt, weight]]) => {
                    const id = `${idname}d${indxxx}`;
                    const curridx = indxxx-1;
                    const fragmentKey = `Fragment ${indxxx-1}`;
                    indxxx++; // Increment index for the next iteration
                    

                    return (
                      <div
                        key={mol}
                        id={id}
                        className="moleculediv"
                        onClick={() => addToList(id,idname,curridx)}
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
                            <img src={imgSrc} alt={imgAlt} className="imgselector2" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "15px"}}>{fragmentKey} : {fragWeights[fragmentKey].toFixed(2)}</p>
                          </div>
                          
                        }
                        {fragmentKey === "Fragment 1" &&
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselector2" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "15px"}}>{fragmentKey} : {fragWeights[fragmentKey].toFixed(2)}</p>
                          </div>
                          
                        }
                        {fragmentKey === "Fragment 2" && 
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselector2" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "15px"}}>{fragmentKey} : {fragWeights[fragmentKey].toFixed(2)}</p>
                          </div>
                        }
                        {fragmentKey === "Fragment 3" && 
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselector2" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "15px"}}>{fragmentKey} : {fragWeights[fragmentKey].toFixed(2)}</p>
                          </div> 
                        }
                        {fragmentKey === "Fragment 4" && 
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselector2" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "15px"}}>{fragmentKey} : {fragWeights[fragmentKey].toFixed(2)}</p>
                          </div>
                          
                        }
                        {fragmentKey === "Fragment 5" && 
                        <div>
                          <img src={imgSrc} alt={imgAlt} className="imgselector2" />
                          <p style={{display: "flex", justifyContent: "center", marginTop: "15px"}}>{fragmentKey} : {fragWeights[fragmentKey].toFixed(2)}</p>
                        </div>
                        }
                        {fragmentKey === "Fragment 6" && 
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselector2" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "15px"}}>{fragmentKey} : {fragWeights[fragmentKey]}</p>
                          </div>

                        }
                        {fragmentKey !== "Fragment 0" && fragmentKey !== "Fragment 1" && fragmentKey !== "Fragment 2" && fragmentKey !== "Fragment 3" && fragmentKey !== "Fragment 4" && fragmentKey !== "Fragment 5" && fragmentKey !== "Fragment 6" && 
                          <div>
                            <img src={imgSrc} alt={imgAlt} className="imgselector2" />
                            <p style={{display: "flex", justifyContent: "center", marginTop: "20px"}}>{fragmentKey} : {fragWeights[fragmentKey]}</p>
                          </div>
                        }

                      
                      </div>
                    );
                  })}
                  </div>
    </div>
    </div>
  )
}
