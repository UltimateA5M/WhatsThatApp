import React, { Component } from 'react';
import { Text, View, Button, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { FlatList } from 'react-native-web';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ProfileScreen extends Component{

  constructor(props){
    super(props);

    this.state = {
        first_name: "",
        last_name: "",
        email: "", 
        userData: [],
        isLoading: true        
    };
  }

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();      
    });
    this.getProfileInfo();
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

  async getProfileInfo(){
    const user_id = await AsyncStorage.getItem('whatsthat_user_id');

    return fetch("http://localhost:3333/api/1.0.0/user/" + user_id, {
      method: "GET",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
     .then((response) => {
      if(response.status === 200){
        console.log("fetched successfully");
        return response.json();
      }else if(response.status === 401){
        console.log("Unauthorized");
      }else if(response.status === 404){
        console.log("User not found");
      }else{
        console.log("Server Error");
      }
     })
     .then((responseJson) => {      
       this.setState({
         isLoading: false,
         userData: responseJson
       })
       console.log(responseJson)
       console.log(this.state.userData)
     })
     .catch((error) => {
       console.log(error);
     });
  }

  static navigationOptions = {
    header: null
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
          <SafeAreaView>
            <View style={styles.container}>
              <Text>Profile Screen</Text>
              <FlatList
                data={this.state.userData}
                renderItem={({user}) => (
                  <View>
                    <Text>first name: {user.first_name}</Text>
                    <Text>{user.last_name}</Text>
                    <Text>{user.email}</Text>
                  </View>
                )}
                //keyExtractor={(user) => user_id}
                keyExtractor={({id}, index) => id}
              />
            </View>
          </SafeAreaView>
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

export default ProfileScreen;
