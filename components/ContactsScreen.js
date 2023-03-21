import React, { Component } from 'react';
import { Text, View, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { FlatList } from 'react-native-web';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class ContactsScreen extends Component{

  constructor(props){
    super(props);

    this.state = {
        first_name: "",
        last_name: "",
        email: "", 
        isLoading: true,
        userData: [],
    }
  }

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();      
    });
    this.getContacts();
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

  async getContacts(){
    return fetch("http://localhost:3333/api/1.0.0/contacts",{
      method: "get",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
     .then((response) => {
      if(response.status === 200){
        console.log("contacts fetched successfully");
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
       console.log(responseJson);
     })
     .catch((error) => {
       console.log(error);
     })
  }

  async deleteContact( user_id ){
    return fetch("http://localhost:3333/api/1.0.0/user/"+ user_id + "/contact", {
      method: "DELETE",
      headers: {
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
    .then(async (response) => {
        if(response.status === 200){
            return response.json();
            console.log("Contact Removed");
        }else if(response.status === 400){
            throw "You can't remove yourself as a contact"
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
    if(this.state.isLoading){
      return(
        <View>
          <ActivityIndicator />
        </View>
      );
    }else{
      return(
          <View style={styles.container}>
            <FlatList
              data={this.state.userData}
              renderItem={(contact) => (
                <View>
                  <Text>{contact.item.first_name} {contact.item.last_name}</Text>
                  <Button title="Remove" onPress={() => this.deleteContact(contact.item.user_id)}/>
                </View>
              )}
              keyExtractor={(contact, index) => contact.user_id}
            />
          </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "80%",
    alignItems: "stretch",
    justifyContent: "center"
  }
});

