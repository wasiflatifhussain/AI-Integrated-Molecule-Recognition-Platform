import React, { useEffect } from 'react';
// import $3Dmol from '3dmol/build/3Dmol-nojquery';

const My3DViewer = () => {
  console.log("yo");
  return <div style={{height: "400px", width: "400px", position: "relative"}} class='viewer_3Dmoljs' data-href='/getPDBData/wasif.pdb' data-backgroundcolor='0xffffff' data-style='stick' data-ui='true'></div> ;
};

export default My3DViewer;
