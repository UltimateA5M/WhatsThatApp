import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';

export default class ChatOptions extends Component{

  constructor(props){
    super(props);

    this.state = {
        chat_id: "",
        chat_name: "",
        isLoading: true,
        chatData: {},
    }
  }

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();

      this.setState({
        chatData: this.props.route.params.data,
        chat_id: this.props.route.params.chat_id,
        chat_name: this.props.route.params.data.name,
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

  async updateChatInfo(){

    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.chat_id,{
      method: "PATCH",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({name: this.state.chat_name})
    })
     .then((response) => {
      if(response.status === 200){
        console.log("Name Updated");
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

  async removeUser( user_id ){
    return fetch("http://localhost:3333/api/1.0.0/chat/"+ this.state.chat_id + "/user/" + user_id, {
      method: "DELETE",
      headers: {
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
    .then(async (response) => {
        if(response.status === 200){
            console.log("User Removed");            
        }else if(response.status === 401){
            throw "Unauthorized"
        }else if(response.status === 403){
            throw "Forbidden"
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
    return(
        <View style={styles.container}>

          <TextInput
            style={{height: 40, borderWidth: 1, width: "80%", alignSelf: "center"}}
            placeholder="Enter Chat Name.."
            onChangeText={chat_name => this.setState({chat_name})}
            defaultValue={this.state.chat_name}
          />
          
          <View>
            <TouchableOpacity onPress={() => this.updateChatInfo()}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Update</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text> User Management </Text>

          <FlatList
            data={this.state.chatData.members}
            renderItem={(member) => (
              <View>
                {/* <Text> {JSON.stringify(member)}</Text> */}
                
                <TouchableOpacity onPress={() => this.removeUser( member.item.user_id )}>
                    <Text> { member.item.first_name } { member.item.last_name } </Text>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Remove</Text>
                    </View>
                </TouchableOpacity>
              </View>
              )}
              keyExtractor={(member, index) => member.user_id}
          />

          <TouchableOpacity onPress={() => this.props.navigation.navigate('AddUserToChat', {data: this.state.chatData, chat_id: this.state.chat_id})}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Add User To Chat</Text>
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