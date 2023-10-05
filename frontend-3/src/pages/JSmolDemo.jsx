import React, { useEffect } from 'react';
import $ from 'jquery';
import Jmol from "./jsmol/JSmol.min.js";
import GLmol from "./jsmol/JSmol.GLmol.min.js";

const JSmolDemo = () => {
  useEffect(() => {
    const jmol_isReady = function (applet) {
      document.title = applet._id + " - Jmol " + Jmol.___JmolVersion;
      Jmol._getElement(applet, "appletdiv").style.border = "1px solid blue";
    };

    const Info = {
      width: 300,
      height: 300,
      debug: false,
      color: "0xFFFFFF",
      serverURL: "https://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
      use: "WEBGL HTML5",
      j2sPath: "./jsmol/j2s",
      readyFunction: jmol_isReady,
      script: `${process.env.PUBLIC_URL}set antialiasDisplay;load data/caffeine.mol`,
      disableJ2SLoadMonitor: true,
      disableInitialConsole: true,
      allowJavaScript: true,
    };

    $(document).ready(function () {
      $("#appdiv").html(Jmol.getAppletHtml("jmolApplet0", Info));
    });
  }, []);

  const onSubmitButtonClicked = () => {
    const varvar = document.getElementById("golden").value;
    const link = document.createElement("a");
    link.href = `javascript:Jmol.script(jmolApplet0, 'load ${varvar}.pdb')`;
    link.innerHTML = "reading";
    link.click();
  };

  return (
    <div>
      <table cellPadding={10}>
        <tr>
          <td valign="top">
            <div id="appdiv"></div>
            <br />
          </td>
          <td valign="top">
            <table cellPadding={5}>
              <tr>
                <td valign="top" id="linkContainer">
                  <input type="text" id="golden" />
                  <input
                    type="submit"
                    value="Submit"
                    onClick={onSubmitButtonClicked}
                  />
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  );
};

export default JSmolDemo;
