import React, { Component } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-web';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class AddUserToChat extends Component{

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
        userData: [],
        chatData: {},
        chat_id: ""
    }
  }

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
    });
    this.setState({
        chatData: this.props.route.params.data,
        chat_id: this.props.route.params.chat_id
    })
    this.getContacts();
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

  async addUser( user_id ){
    return fetch("http://localhost:3333/api/1.0.0/chat/"+ this.state.chat_id + "/user/" + user_id, {
        method: "POST",
        headers: {
            "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
        }
    })
    .then(async (response) => {
        if(response.status === 200){
            console.log("User Added To Chat");
        }else if(response.status === 400){
            throw "Bad Request"
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
        console.log(error)
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

                  <TouchableOpacity onPress={() => this.addUser(contact.item.user_id)}>
                    <View style={styles.button}>
                      <Text style={styles.buttonText}>Add</Text>
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

