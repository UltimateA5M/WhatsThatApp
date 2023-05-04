import React, { Component } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-web';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class ContactsScreen extends Component{

  constructor(props){
    super(props);

    this.state = {
        first_name: "",
        last_name: "",
        email: "",
        searchValue: "",
        isLoading: true,
        searched: false,
        showContacts: true,
        success: false,
        userData: [],
    }
  }

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.getContacts();
    });
  }
  
  componentWillUnmount(){
    this.unsubscribe();
    this.setState({ searched: false })
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null){
      this.props.navigation.navigate('Login');
    }
  };

  async searchContacts(){
    return fetch("http://localhost:3333/api/1.0.0/search?q=" + this.state.searchValue + "&search_in=contacts",{
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
         searched: true,
         showContacts: false,
         userData: responseJson
       })
     })
     .catch((error) => {
       console.log(error);
     })
  }

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

     })
     .catch((error) => {
       console.log(error);
     })
  }

  async blockUser( user_id ){
    return fetch("http://localhost:3333/api/1.0.0/user/"+ user_id + "/block", {
        method: "POST",
        headers: {
            "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
        }
    })
    .then(async (response) => {
        if(response.status === 200){
            console.log( "user blocked" )
            this.getContacts()
            return response.json();
        }else if(response.status === 400){
            this.setState({"error": "You can't block yourself"})
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

  async deleteContact( user_id ){
    return fetch("http://localhost:3333/api/1.0.0/user/"+ user_id + "/contact", {
      method: "DELETE",
      headers: {
          "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
    .then(async (response) => {
        if(response.status === 200){
            console.log("Contact Removed");
            this.getContacts()
            return response.json();
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

            <TextInput
              style={{height: 40, borderWidth: 1, width: "100%", alignSelf: "center"}}
              placeholder="Search..."
              onChangeText={searchValue => this.setState({searchValue})}
              defaultValue={this.state.searchValue}
            />
            
            <View>
              <TouchableOpacity onPress={() => this.searchContacts()}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Search</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('BlockedContacts')}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>View Blocked Contacts</Text>
                </View>
              </TouchableOpacity>
            </View>

            <FlatList
              data={this.state.userData}
              renderItem={(contact) => (
                <View>
                  <> 

                    { this.state.searched &&                      
                      <Text>{contact.item.given_name} {contact.item.family_name}</Text>
                    }

                  </>
                  
                  <>

                    { this.state.showContacts &&
                      <Text> {contact.item.first_name} {contact.item.last_name}</Text>
                    }
                  
                  </>                  

                  <TouchableOpacity onPress={() => this.blockUser(contact.item.user_id)}>
                    <View style={styles.button}>
                      <Text style={styles.buttonText}>Block</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.deleteContact(contact.item.user_id)}>
                    <View style={styles.button}>
                      <Text style={styles.buttonText}>Remove</Text>
                    </View>
                  </TouchableOpacity>
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

