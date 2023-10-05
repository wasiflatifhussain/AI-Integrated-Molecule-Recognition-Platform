// import React from 'react';
// import Popupbox from 'react-popupbox';
// import 'react-popupbox/dist/react-popupbox.css'; // Import the styles for the popup

// const Popup3DViewer = ({ isOpen, onClose }) => {
//   console.log(isOpen)
//   console.log(onClose);
//   return (
//     <Popupbox
//       isOpen={isOpen}
//       content={<div style={{height: "400px", width: "400px", position: "relative"}} class='viewer_3Dmoljs' data-href='/getPDBData/wasif.pdb' data-backgroundcolor='0xffffff' data-style='stick' data-ui='true'></div>}
//       onRequestClose={onClose}
//     />
//   );
// };

// export default Popup3DViewer;

import React from 'react';
import Popupbox from 'react-popupbox';
import 'react-popupbox/dist/react-popupbox.css';

const Popup3DViewer = ({ isOpen, onClose }) => {
  const popupContent = (
    <div style={{ height: "400px", width: "400px", position: "relative" }}>
      {/* Your 3D Viewer content here */}
    </div>
  );

  const popupOptions = {
    content: popupContent,
    onClosed: onClose,
  };

  return (
    <Popupbox
      isOpen={isOpen}
      {...popupOptions}
    />
  );
};

export default Popup3DViewer;

