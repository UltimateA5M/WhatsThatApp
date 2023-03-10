import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Text, View, Button } from 'react-native';

class HomeScreen extends Component{

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
  };

  static navigationOptions = {
    header: null
  }

  render(){
    return(
        <View>
          <Text>Home Screen</Text>
          <Button
            title="To Profile"
            onPress={() => this.props.navigation.navigate('Profile')}
           />
        </View>
    );
  }
}

export default HomeScreen;
