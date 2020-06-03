import React from 'react';
import '../assets/css/App.css';
import OLMapFragment from '../components/OLMapFragment'
import colors from '../assets/img/bg/disco-db86.png' 

function App() {
  return (
    <div className="App">
      <body className="App-body"  styles={{ backgroundImage:`url(${colors})`}}>
        Vehicle Tracker<br/>
        <OLMapFragment />
      </body>
    </div>
  );
}

export default App;
