import React, { Component } from 'react';
import { Text, View, Button, StyleShee, ActivityIndicator } from 'react-native';
import { FlatList } from 'react-native-web';

class ProfileScreen extends Component{

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

  getProfileInfo(){
    let to_send = {
      email: this.state.email,
      password: this.state.password
    };
    return fetch("http://localhost:3333/api/1.0.0/user/" + {user_id})
     .then((response) => response.json())
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
          <View style={styles.container}>
            <Text>Profile Screen</Text>
            <FlatList
              data={this.state.userData}
              renderItem={({item}) => (
                <View>
                  <Text>{item.item_name}</Text>
                  <Button
                    title="Delete"
                    onPress={() => console.log("delete")}
                  />                  
                </View>
              )}
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

export default ProfileScreen;
