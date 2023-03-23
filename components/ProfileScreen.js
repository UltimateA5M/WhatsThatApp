import React, { Component } from 'react';
import { Text, View, Button, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { TextInput } from 'react-native-web';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ProfileScreen extends Component{

  constructor(props){
    super(props);

    this.state = {
        photo: null,
        userId: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        userData: {},
        isLoading: true,
        editable: false       
    };

    this.updateInfo = this.updateInfo.bind(this)
    this.toggleEditable = this.toggleEditable.bind(this)
  }

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.getProfileInfo();
      this.get_profile_image();
    });
  }
  
  componentWillUnmount(){
    this.unsubscribe();
  }
  
  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null){
      this.props.navigation.navigate('Login');
    }
  };

  toggleEditable(){
    this.setState({
      editable: !this.state.editable
    })
  }

  async get_profile_image(){
    const user_id = await AsyncStorage.getItem('whatsthat_user_id');
    fetch("http://localhost:3333/api/1.0.0/user/" + user_id + "/photo", {
      method: "GET",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
    .then((response) => {
      return response.blob()
    })
    .then((responseBlob) => {
      let data = URL.createObjectURL(responseBlob);

      this.setState({
        photo: data,
        isLoading: false
      })
    })
    .catch((error) => {
      console.log(error);
    });
  }

  async getProfileInfo(){
    const user_id = await AsyncStorage.getItem('whatsthat_user_id');
    //this.setState({ userID: parseInt(user_id) })

    return fetch("http://localhost:3333/api/1.0.0/user/" + user_id, {
      method: "GET",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
     .then((response) => {
      if(response.status === 200){
        console.log("profile fetched");
        return response.json();
      }else if(response.status === 401){
        console.log("Unauthorized");
      }else if(response.status === 404){
        console.log("User not found");
      }else{
        console.log("Server Error");
      }
     })
     .then((responseJson) => {      
       this.setState({
         isLoading: false,
         userData: responseJson
       })
      console.log(responseJson)
     })
     .catch((error) => {
       console.log(error);
     });
  }

  async updateInfo(){
    let to_send = {};

    if (this.state.first_name != this.state.userData.first_name && this.state.first_name != ""){
      to_send['first_name'] = this.state.first_name;
    }

    if (this.state.last_name != this.state.userData.last_name && this.state.last_name != ""){
      to_send['last_name'] = this.state.last_name;
    }

    if (this.state.email != this.state.userData.email && this.state.email != ""){
      to_send['email'] = this.state.email;
    }

    if (this.state.password != this.state.userData.password && this.state.password != ""){
      to_send['password'] = this.state.password;
    }

    const user_id = await AsyncStorage.getItem('whatsthat_user_id');

    return fetch("http://localhost:3333/api/1.0.0/user/" + user_id, {
      method: "PATCH",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(to_send)
    })
     .then((response) => {
      if(response.status === 200){
        console.log("profile updated");
      }else if(response.status === 400){
        console.log("Bad Request");
      }else if(response.status === 401){
        console.log("Unauthorised");
      }else if(response.status === 403){
        console.log("Forbidden");
      }else if(response.status === 404){
        console.log("Not Found");
      }else{
        console.log("Server Error");
      }
     })
     .catch((error) => {
       console.log(error);
     });
  }

  static navigationOptions = {
    header: null
  }

  render(){
    if(this.state.isLoading){
      return(
        <View>
          <ActivityIndicator />
        </View>
      );
    }else{    
      return(
      <View style={styles.container}>
        <Image source={{ uri: this.state.photo }} style={{ width: 100, height: 100, alignSelf: "center"}} />

        <Text>First Name:</Text>
        <TextInput
          style={{height: 40, borderWidth: 1, width: "100%"}}
          defaultValue={this.state.userData.first_name}
          onChangeText={first_name => this.setState({first_name})}
          //editable={this.state.editable}
          />
          <Text>Last Name:</Text>
          <TextInput
            style={{height: 40, borderWidth: 1, width: "100%"}}
            defaultValue={this.state.userData.last_name}
            onChangeText={last_name => this.setState({last_name})}
            //editable={this.state.editable}
            />
          <Text>Email:</Text>
          <TextInput
            style={{height: 40, borderWidth: 1, width: "100%"}}
            defaultValue={this.state.userData.email}
            onChangeText={email => this.setState({email})}
            //editable={this.state.editable}
          />
          <Text>Password:</Text>
          <TextInput
            style={{height: 40, borderWidth: 1, width: "100%"}}  
            defaultValue="password..."
            onChangeText={password => this.setState({password})}
            secureTextEntry
          />
          {/* <View>
                  <TouchableOpacity onPress={this.toggleEditable}>
                      <View style={styles.button}>
                          <Text style={styles.buttonText}>Edit</Text>
                      </View>
                  </TouchableOpacity>
              </View> */}
          <View>
            <TouchableOpacity onPress={() => this.updateInfo()}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Update</Text>
              </View>
            </TouchableOpacity>
          </View>
      </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "stretch",
    justifyContent: "center"
  },
  button: {
    marginBottom: 30,
    backgroundColor: '#2196F3',
    width: '50%',
    alignSelf: "center"
  },
  buttonText: {
    textAlign: 'center',
    padding: 20,
    color: 'white'
  },
});

export default ProfileScreen;
