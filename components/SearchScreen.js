import React, { Component } from 'react';
import { Text, View, Button, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { FlatList } from 'react-native-web';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class SearchScreen extends Component{

  constructor(props){
    super(props);

    this.state = {
        first_name: "",
        last_name: "",
        email: "",
        searchValue: "",
        error: "",
        submitted: false,
        isLoading: true,
        userData: [],
    }
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
    else{
      this.setState({ isLoading: false })
    }
  };

  async search(){
    return fetch("http://localhost:3333/api/1.0.0/search?q=" + this.state.searchValue,{
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
       console.log(responseJson);
       console.log(this.state.userData);
     })
     .catch((error) => {
       console.log(error);
     })
  }

  async addContact( user_id ){
    return fetch("http://localhost:3333/api/1.0.0/user/"+ user_id + "/contact", {
        method: "POST",
        headers: {
            "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
        }
    })
    .then(async (response) => {
        if(response.status === 200){
            return response.json();
        }else if(response.status === 400){
            throw "You can't add yourself as a contact"
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

  async blockUser( user_id ){
    return fetch("http://localhost:3333/api/1.0.0/user/"+ user_id + "/block", {
        method: "POST",
        headers: {
            "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
        }
    })
    .then(async (response) => {
        if(response.status === 200){
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
              <TouchableOpacity onPress={() => this.search()}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Search</Text>
                </View>
              </TouchableOpacity>
            </View>

            <FlatList
              data={this.state.userData}
              renderItem={(user) => (
                <View>
                  <Text>Name: {user.item.given_name} {user.item.family_name}</Text>
                  <Text>Email: {user.item.email}</Text>
                  <Button title="Add" style={styles.button} onPress={() => this.addContact(user.item.user_id)}/>
                  <Button title="Block" style={styles.button} onPress={() => this.blockUser(user.item.user_id)}/>
                </View>
              )}
              keyExtractor={(user, index) => user.user_id}
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

