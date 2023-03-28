import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

export default class NewChatScreen extends Component{

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

    this._onPressButton = this._onPressButton.bind(this)
    this.newChat = this.newChat.bind(this)
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

  async newChat(){

    return fetch("http://localhost:3333/api/1.0.0/chat",{
      method: "post",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({name: this.state.chat_name})
    })
     .then((response) => {
      if(response.status === 201){
        console.log("Chat Created");
        return response.json();
      }else if(response.status === 400){
        console.log("Bad Request");
      }else if(response.status === 401){
        console.log("Unauthorized");
      }else{
        console.log("Server Error");
      }
     })
     .then((responseJson) => {
      console.log(responseJson)
     })
     .catch((error) => {
       console.log(error);
     })
  }

  _onPressButton(){
    this.newChat()
    
    // validation here
        
    this.props.navigation.navigate('Chats')
  }

  static navigationOptions = {
    header: null
  }

  render(){
    return(
        <View style={styles.container}>

            <TextInput
              style={{height: 40, borderWidth: 1, width: "100%", alignSelf: "center"}}
              placeholder="Chat Name..."
              onChangeText={chat_name => this.setState({chat_name})}
              defaultValue={this.state.chat_name}
            />

            <TouchableOpacity onPress={this.newChat}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Create Chat</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.props.navigation.navigate('Chats')}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Back</Text>
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