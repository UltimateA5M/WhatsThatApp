import React, { Component } from 'react';
import {
  Text, View, StyleSheet, ActivityIndicator, TouchableOpacity, Image,
} from 'react-native';
import { TextInput } from 'react-native-web';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class ProfileScreen extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      photo: null,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      userData: {},
      isLoading: true,
    };

    this.updateInfo = this.updateInfo.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.getProfileInfo();
      this.get_profile_image();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  async get_profile_image() {
    const userId = await AsyncStorage.getItem('whatsthat_user_id');
    fetch(`http://localhost:3333/api/1.0.0/user/${userId}/photo`, {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then((response) => response.blob())
      .then((responseBlob) => {
        const data = URL.createObjectURL(responseBlob);

        this.setState({
          photo: data,
          isLoading: false,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async getProfileInfo() {
    const userId = await AsyncStorage.getItem('whatsthat_user_id');

    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}`, {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('profile fetched');
          return response.json();
        } if (response.status === 401) {
          console.log('Unauthorized');
        } else if (response.status === 404) {
          console.log('User not found');
        } else {
          console.log('Server Error');
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          userData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null) {
      this.props.navigation.navigate('Login');
    }
  };

  async updateInfo() {
    const toSend = {};

    if (this.state.firstName !== this.state.userData.first_name && this.state.firstName !== '') {
      toSend.first_name = this.state.firstName;
    }

    if (this.state.lastName !== this.state.userData.last_name && this.state.lastName !== '') {
      toSend.last_name = this.state.lastName;
    }

    if (this.state.email !== this.state.userData.email && this.state.email !== '') {
      toSend.email = this.state.email;
    }

    if (this.state.password !== this.state.userData.password && this.state.password !== '') {
      toSend.password = this.state.password;
    }

    const userId = await AsyncStorage.getItem('whatsthat_user_id');

    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}`, {
      method: 'PATCH',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toSend),
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('profile updated');
        } else if (response.status === 400) {
          console.log('Bad Request');
        } else if (response.status === 401) {
          console.log('Unauthorised');
        } else if (response.status === 403) {
          console.log('Forbidden');
        } else if (response.status === 404) {
          console.log('Not Found');
        } else {
          console.log('Server Error');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async logout() {
    console.log('Logout');

    return fetch('http://localhost:3333/api/1.0.0/logout', {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          await AsyncStorage.removeItem('whatsthat_session_token');
          await AsyncStorage.removeItem('whatsthat_user_id');
          this.props.navigation.navigate('Login');
        } else if (response.status === 401) {
          console.log('Unauthorised');
          await AsyncStorage.removeItem('whatsthat_session_token');
          await AsyncStorage.removeItem('whatsthat_user_id');
          this.props.navigation.navigate('Login');
        } else {
          throw 'Something went wrong';
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={styles.container}>

        <TouchableOpacity onPress={() => this.logout()}>
          <View style={styles.logoutButton}>
            <Text style={styles.buttonText}>Logout</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.props.navigation.navigate('CameraScreen', { data: this.state.userData })}>
          <Image source={{ uri: this.state.photo }} style={{ width: 100, height: 100, alignSelf: 'center' }} />
        </TouchableOpacity>

        <Text style={{ marginStart: 10 }}>First Name:</Text>
        <TextInput
          style={styles.textFields}
          defaultValue={this.state.userData.first_name}
          onChangeText={(firstName) => this.setState({ firstName })}
        />
        <Text style={{ marginStart: 10 }}>Last Name:</Text>
        <TextInput
          style={styles.textFields}
          defaultValue={this.state.userData.last_name}
          onChangeText={(lastName) => this.setState({ lastName })}
        />
        <Text style={{ marginStart: 10 }}>Email:</Text>
        <TextInput
          style={styles.textFields}
          defaultValue={this.state.userData.email}
          onChangeText={(email) => this.setState({ email })}
        />
        <Text style={{ marginStart: 10 }}>Password:</Text>
        <TextInput
          style={styles.textFields}
          defaultValue="password..."
          onChangeText={(password) => this.setState({ password })}
          secureTextEntry
        />

        <View>
          <TouchableOpacity onPress={() => this.updateInfo()}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Update</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  button: {
    marginTop: 10,
    marginRight: 10,
    backgroundColor: '#2196F3',
    width: '25%',
    length: '10%',
    borderRadius: 4,
    alignSelf: 'center',
  },
  buttonText: {
    textAlign: 'center',
    padding: 20,
    color: 'white',
  },
  logoutButton: {
    marginRight: 10,
    marginBottom: 20,
    backgroundColor: '#2196F3',
    width: '25%',
    length: '10%',
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  textFields: {
    height: 35,
    borderWidth: 1,
    width: '80%',
    alignSelf: 'center',
  },
});
