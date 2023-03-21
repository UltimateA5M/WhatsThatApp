import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Text, View, Button } from 'react-native';

class HomeScreen extends Component{

  constructor(props){
    super(props);

    this.state = {
        error: "",
        submitted: false,
        isLoading: true,
        chatsData: [],
    }
  }

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
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

  async getChats(){
    return fetch("http://localhost:3333/api/1.0.0/chats",{
      method: "GET",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
     .then((response) => {
      if(response.status === 200){
        console.log("chats fetched successfully");
        return response.json();
      }else if(response.status === 401){
        console.log("Unauthorized");
      }else{
        console.log("Server Error");
      }
     })
     .then((responseJson) => {
       this.setState({
         isLoading: false,
         chatsData: responseJson
       })
     })
     .catch((error) => {
       console.log(error);
     })
  }

  static navigationOptions = {
    header: null
  }

  render(){
    return(
        <View>
          <Text>Home Screen</Text>
          <Button
            title="To Profile"
            onPress={() => this.props.navigation.navigate('Profile')}
           />
        </View>
    );
  }
}

export default HomeScreen;
