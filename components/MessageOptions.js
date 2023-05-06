import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';

export default class ChatOptions extends Component{

  constructor(props){
    super(props);

    this.state = {
        chat_id: "",
        message_id: "",
        message_text: "",
        messageData: {}
    }

    this.updateMessage = this.updateMessage.bind(this)
    this.deleteMessage = this.deleteMessage.bind(this)
  }

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();

      this.setState({
        messageData: this.props.route.params.data,
        chat_id: this.props.route.params.chat_id,
        message_id: this.props.route.params.data.item.message_id,
        message_text: this.props.route.params.data.item.message
      })

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

  async updateMessage(){
    let to_send = {};
    
    to_send['message'] = this.state.message_text;

    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.chat_id + "/message/" + this.state.message_id, {
      method: "PATCH",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(to_send)
    })
     .then((response) => {
      if(response.status === 200){
        console.log("message updated");
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

  async deleteMessage(){
    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.chat_id + "/message/" + this.state.message_id, {
      method: "DELETE",
      headers: {
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
    .then(async (response) => {
        if(response.status === 200){
            console.log("Message Deleted");            
        }else if(response.status === 403){
            throw "Forbidden"
        }else if(response.status === 401){
            throw "Unauthorized"
        }else if(response.status === 404){
            throw "Not Found"
        }else{
            throw "Server Error"
        }
    })
    .catch((error) => {
      console.log(error);
    })
  }

  render(){
    console.log("CHAT ID:" + this.state.chat_id + "MSG ID:"+ this.state.message_id + this.state.message_text)
    return(
        <View style={styles.container}>
          <Text>message:</Text>
          <TextInput
          style={{height: 40, borderWidth: 1, width: "100%"}}
          defaultValue={this.state.message_text}
          onChangeText={message_text => this.setState({message_text})}
          />

          <TouchableOpacity onPress={() => this.updateMessage()}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Update Message</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.deleteMessage()}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Delete Message</Text>
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
    width: '30%',
    alignSelf: "center"
  },
  buttonText: {
    textAlign: 'center',
    padding: 20,
    color: 'white'
  },
});