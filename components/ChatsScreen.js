import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default class ChatsScreen extends Component{

  constructor(props){
    super(props);

    this.state = {
        chat_id: "",
        chat_name: "",
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
    this.getChats();
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
    return fetch("http://localhost:3333/api/1.0.0/chat",{
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
       console.log(responseJson)
     })
     .catch((error) => {
       console.log(error);
     })
  }

  async viewChat( chat_id ){

    return fetch("http://localhost:3333/api/1.0.0/chat/" + chat_id, {
      method: "GET",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
     .then((response) => {
      if(response.status === 200){
        console.log("Chat Loaded");
        return response.json();
      }else if(response.status === 401){
        console.log("Unauthorized");
      }else if(response.status === 403){
        console.log("Forbidden");
      }else if(response.status === 404){
        console.log("chat not found");
      }else{
        console.log("Server Error");
      }
     })
     .then((responseJson) => {      
       this.setState({
         isLoading: false,
         chatsData: responseJson
       })
      console.log(responseJson)
     })
     .catch((error) => {
       console.log(error);
     });
  }

  static navigationOptions = {
    header: null
  }

  render(){
    return(
        <View style={styles.container}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('NewChatScreen')}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>+Chat</Text>
              </View>
            </TouchableOpacity>
        </View>
    );
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