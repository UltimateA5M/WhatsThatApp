import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';

export default class ViewChatScreen extends Component{

  constructor(props){
    super(props);

    this.state = {
        chat_id: "",
        name: "",
        isLoading: true,
        originalChatData: {},
        chatData: {},
    }

    this._onPressButton = this._onPressButton.bind(this)
  }

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.setState({
        originalChatData: this.props.route.params.data,
        chat_id: this.props.route.params.data.chat_id
      })
      this.loadChat( this.state.chat_id );
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

  async loadChat( chat_id ){

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
        console.log("Chat not found");
      }else{
        console.log("Server Error");
      }
     })
     .then((responseJson) => {      
       this.setState({
         isLoading: false,
         chatData: responseJson
       })
      console.log(responseJson)
     })
     .catch((error) => {
       console.log(error);
     });
  }

  _onPressButton(){
    
    // validation here
        
    this.props.navigation.navigate('Chats')
  }

  static navigationOptions = {
    header: null
  }

  render(){
    console.log("Original Data:" + this.state.originalChatData)
    console.log("New Data:" + this.state.chatData)
    return(
        <View style={styles.container}>        

        {/* <FlatList
              data={this.state.chatData}
              renderItem={(item) => (
                <View>
                  <Text> {JSON.stringify(item)}</Text>
                  <Text>Chat Name: {chat.item.name} </Text>
                </View>
              )}
              keyExtractor={(item, index) => item.members.user_id}
            /> */}
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