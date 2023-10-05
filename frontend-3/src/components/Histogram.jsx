import React from 'react';
import { Bar } from 'react-chartjs-2';

const Histogram = (data) => {
  const getHomoValues = () => {
    console.log(data.data);
    const homoValues = data.data.map(row => row[1]);
    return homoValues;
  }

  const chartData = {
    labels: ['homo'],
    datasets: [
      {
        label: 'Homo Values',
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 2,
        data: getHomoValues(),
      }
    ]
  };

  return (
    <div>
      <h2>Histogram of Homo Values</h2>
      <Bar
        data={chartData}
        options={{
          title:{
            display:true,
            text:'Homo Values',
            fontSize:20
          },
          legend:{
            display:false,
          }
        }}
      />
    </div>
  );
}

export default Histogram;