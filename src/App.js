import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation'
import Signin from './components/Signin/Signin'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import './App.css';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
 apiKey: '1ecace96280949d684f58ca7f728fe66'
});

const particlesOptions = {
  particles: {
    number: {
      value: 60,
      density: {
        enable: true,
        value_area: 400
      }
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP._YcB0ORZ06hfhcNWU5SuOwHaEo%26pid%3DApi&f=1',
      imageUrl: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP._YcB0ORZ06hfhcNWU5SuOwHaEo%26pid%3DApi&f=1',
      box: {},
      route: 'signin'
    }
  }

  calculateFaceLocation = (data) => {
    // console.log('calculateFaceLocation data', data);
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    // console.log('clarifaiFace', clarifaiFace);
    const image = document.getElementById('inputimage')
    // console.log('image', image)
    const width = Number(image.width);
    // console.log('width', width);
    const height = Number(image.height);
    // console.log('height', height);
    const box = {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
    // console.log('calculateFaceLocation box', box);
    return box
  }

  displayFaceBox = (box) => {
    console.log('displayFaceBox_top this.state.box', this.state.box)
    this.setState({box: box});
    console.log('displayFaceBox_bottom this.state.box', this.state.box)
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input })
    app.models.predict(
        Clarifai.FACE_DETECT_MODEL, 
        this.state.input)
        .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
        .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    this.setState({route: route});
    console.log('onRouteChange() this.state.route ', this.state.route )
  }

  render() {
    console.log('render() this.state.route', this.state.route)
    return (
      <div className="App">
        <Particles className='particles'
        params={particlesOptions} 
        />
        <Navigation onRouteChange={this.onRouteChange}/>
        { this.state.route === 'signin'
        ? <Signin onRouteChange={this.onRouteChange}/> 
        : <div>
            <Logo />
            <Rank />
            <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonSubmit={this.onButtonSubmit} 
            />
            <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
          </div>
        } 
      </div>
    );
  }
}

export default App;
