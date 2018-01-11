import React, { Component } from 'react';
import MyStream from "./components/MyStream";
import '@blueprintjs/core/dist/blueprint.css';

class App extends Component {
  render() {
    return (
      <div>
        <h1> Hello! here is random videochat </h1>
        <MyStream />
      </div>
    );
  }
}

export default App;
