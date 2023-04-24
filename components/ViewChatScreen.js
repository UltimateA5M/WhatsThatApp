import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, FlatList, TouchableHighlight, Touchable } from 'react-native';

export default class ViewChatScreen extends Component{

  constructor(props){
    super(props);

    this.state = {
        creator_id: "",
        chat_id: "",
        name: "",
        messageToSend: "",
        isLoading: true,
        chatData: {},
    }
  }

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();

      this.setState({
        chatData: this.props.route.params.data,
        chat_id: this.props.route.params.data.item.chat_id,
        creator_id: this.props.route.params.data.item.creator.user_id,
      })

      this.loadChat( this.props.route.params.data.item.chat_id );
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

  async sendMessage(){

    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.props.route.params.data.item.chat_id + "/message",{
      method: "post",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({message: this.state.messageToSend})
    })
     .then((response) => {
      if(response.status === 200){
        console.log("Sent");
        this.loadChat( this.props.route.params.data.item.chat_id );
        return response.json();
      }else if(response.status === 400){
        console.log("Bad Request");
      }else if(response.status === 401){
        console.log("Unauthorized");
      }else if(response.status === 403){
        console.log("Forbidden")
      }else if(response.status === 404){
        console.log("Not Found")
      }else{
        console.log("Server Error");
      }
     })
     .catch((error) => {
       console.log(error);
     })
  }

  render(){
    return(
        <View style={styles.container}>
         
          <View>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('ChatOptions', {data: this.state.chatData, chat_id: this.state.chat_id})}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Chat Options</Text>
              </View>
            </TouchableOpacity>
          </View>

          <FlatList
            data={this.state.chatData.messages}
            renderItem={(message) => (
              <View>
                {/* <Text> {JSON.stringify(message)}</Text> */}
                <TouchableOpacity onPress={() => this.props.navigation.navigate('MessageOptions', {data: message, chat_id: this.state.chat_id})}>
                  <Text> {message.item.author.first_name}: {message.item.message}</Text>
                </TouchableOpacity>
              </View>
              )}
              keyExtractor={(message, index) => message.message_id}
              inverted={true}
          />

          <TextInput
            style={{height: 40, borderWidth: 1, width: "50%", alignSelf: "flex-start"}}
            placeholder="Enter Message.."
            onChangeText={messageToSend => this.setState({messageToSend})}
            defaultValue={this.state.messageToSend}
          />

          <View>
            <TouchableOpacity onPress={() => this.sendMessage()}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Send</Text>
              </View>
            </TouchableOpacity>
          </View>
          
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
    marginBottom: 20,
    backgroundColor: '#2196F3',
    width: '25%',
    alignSelf: "flex-end",
  },
  buttonText: {
    textAlign: 'center',
    padding: 20,
    color: 'white'
  },
});