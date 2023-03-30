import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';

export default class BlockedContactsScreen extends Component{

  constructor(props){
    super(props);

    this.state = {
        user_id: "",
        name: "",
        isLoading: true,
        userData: [],
    }

    // this._onPressButton = this._onPressButton.bind(this)
  }

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.getBlockedUsers();
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

  async getBlockedUsers(){
    return fetch("http://localhost:3333/api/1.0.0/blocked",{
      method: "GET",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
     .then((response) => {
      if(response.status === 200){
        console.log("users fetched successfully");
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
         userData: responseJson
       })
     })
     .catch((error) => {
       console.log(error);
     })
  }

  async unblockContact( user_id ){
    return fetch("http://localhost:3333/api/1.0.0/user/"+ user_id + "/block", {
        method: "DELETE",
        headers: {
            "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
        }
    })
    .then(async (response) => {
        if(response.status === 200){
            console.log("user unblocked");
            return response.json();
        }else if(response.status === 400){
            throw "You can't block yourself"
        }else if(response.status === 401){
            throw "Unauthorized"
        }else if(response.status === 404){
            throw "Not Found"
        }else{
            throw "Server Error"
        }
    })
    .catch((error) => {
        this.setState({"error": error})
        this.setState({"submitted": false});
    })
  }

  render(){
    return(
        <View style={styles.container}>

            <FlatList
              data={this.state.userData}
              renderItem={(user) => (
                <View>
                  <Text>Name: {user.item.first_name} {user.item.last_name}</Text>
                  <Text>Email: {user.item.email}</Text>
                  <TouchableOpacity onPress={() => this.unblockContact(user.item.user_id)}>
                    <View style={styles.button}>
                      <Text style={styles.buttonText}>Unblock</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(user, index) => user.user_id}
            />

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