import React, { useCallback, useState } from 'react';
import {useDropzone} from 'react-dropzone';
import styled from 'styled-components';
import "./DropZone.css";
// import S3 from 'react-aws-s3';
import axios from 'axios';
import { saveAs } from "file-saver";

// installed using npm install buffer --save
window.Buffer = window.Buffer || require("buffer").Buffer;

const getColor = (props) => {
  if (props.isDragAccept) {
      return '#00e676';
  }
  if (props.isDragReject) {
      return '#ff1744';
  }
  if (props.isFocused) {
      return '#2196f3';
  }
  return '#6D6D6C';
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 40px 30px 40px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: #E7E7E6;
  color: #4E4E4D;
  outline: none;
  transition: border .24s ease-in-out;
  width: 70%;
  height: 120px;
  margin-left: 0px;
  margin-top: 0px;
  marginLeft: 0;
  text-align: center;
`;

function DropZone({receiveParseData}) {
  const [selectedFile,setFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');


  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0])
    setUploadedFileName(acceptedFiles[0].name)
  })

  
    const {
      getRootProps,
      getInputProps,
      isFocused,
      isDragAccept,
      isDragReject,
    } = useDropzone({
      onDrop,
      multiple: false,
      accept: { "text/plain": [".txt"],
                "text/csv": [".csv"]}
    });

    const parseText = () => {
        try {
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result;
                receiveParseData(text);
            }
            reader.readAsText(selectedFile);
            // saveAs(selectedFile, "wasif.csv");
        } catch (err) {
            console.log(err);
        }

    }
  
  return (
    <div id="container">
      <div>
        <Container {...getRootProps({ isFocused, isDragAccept, isDragReject })}>
          <input {...getInputProps()} />
          <p>
            Drag and drop the SMILES file (see example on the right) here, or
            click here to select a file to upload.
          </p>
          <em>(Only *.txt and *.csv file formats are acceptable)</em>
        </Container>
      </div>
      {uploadedFileName && (
        <div class="btnholder">
          <p>
            <input
              id="upBtn"
              type="submit"
              value="Click to upload dropped file"
              className="adjustUp"
              onClick={parseText}
            />
          </p>
          <p id="promptdrop">
            Dropped File: <br></br>
            {uploadedFileName}. Upload?
          </p>
        </div>
        /* document.getElementById("container").style.marginBottom = "20px" */
      )}
      {uploadStatus &&
        ((document.getElementById("promptdrop").innerHTML =
          "File Uploaded Successfully."),
        setUploadStatus(""),
        setTimeout(function () {
          document.getElementById("promptdrop").innerHTML = "";
          setFile(null);
          setUploadedFileName("");
        }, 5000))}
    </div>
  );
}

export default DropZone;