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
        userData: []
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
      method: "GET",
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
       console.log(this.state.userData);
     })
     .catch((error) => {
       console.log(error);
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
            <Text>Contacts Screen</Text>
            <FlatList
              data={this.state.userData}
              renderItem={({contact}) => (
                <View>
                  <Text>first name: {contact.first_name}</Text>                  
                </View>
              )}
              //keyExtractor={(user) => user.user_id}
              keyExtractor={({id}, index) => id}
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
