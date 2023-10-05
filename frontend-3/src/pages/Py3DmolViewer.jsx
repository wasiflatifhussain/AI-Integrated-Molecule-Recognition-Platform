import React, { useState, useEffect } from 'react';

const Py3DmolViewer = () => {
  const [visualizationHTML, setVisualizationHTML] = useState('');

  useEffect(() => {
    const fetchVisualization = async () => {
      try {
        const response = await fetch('/producepy3d');
        const data = await response.json();
        setVisualizationHTML(data.html);
      } catch (error) {
        console.error('Error fetching visualization:', error);
      }
    };

    fetchVisualization();
  }, []);

  return (
    <div id="py3d" dangerouslySetInnerHTML={{ __html: visualizationHTML }} />
  );
};

export default Py3DmolViewer;
