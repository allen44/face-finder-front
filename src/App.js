import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
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
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries, 
      joined: data.joined
    }})
  }

  // componentDidMount() {
  //   console.log('app.componentDidMount()')
  //   fetch('http://localhost:3000/signin', {
  //     method: 'post',
  //     headers: {'Content-Type': 'application/json'},
  //     body: JSON.stringify({
  //         email: 'john@gmail.com',
  //         password: 'cookies'
  //          })
  //   }).then(response => response.json())
  //     .then(console.log)  
  // }
  
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
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onPictureSubmit = () => {
    console.log('onPictureSubmit() this.state.id', this.state.id)
    this.setState({imageUrl: this.state.input })
    app.models.predict(
        Clarifai.FACE_DETECT_MODEL, 
        this.state.input)
        .then(response => {
          if (response) {
            fetch('http://localhost:3000/image', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  id: this.state.user.id
                  })
            })
              .then(response => response.json())
              .then(count => {
                this.setState(Object.assign(this.state.user, { entries: count }))
              })
          }
          this.displayFaceBox(this.calculateFaceLocation(response))
        })
        .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
      this.setState({isSignedIn: 'true'})
    }
    this.setState({route: route});
    console.log('App.onRouteChange() this.state.route ', this.state.route )
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
        params={particlesOptions} 
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home'
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onPictureSubmit} 
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          : ( route === 'signin'
              ? <Signin  loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        } 
      </div>
    );
  }
}

export default App;
