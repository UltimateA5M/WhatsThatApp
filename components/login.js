import React, { Component } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: 'asim@gmail.com',
      password: 'Password123!',
      error: '',
      submitted: false,
      success: false,
    };

    this.onPressButton = this.onPressButton.bind(this);
  }

  onPressButton() {
    this.setState({ submitted: true });
    this.setState({ error: '' });

    if (!(this.state.email && this.state.password)) {
      this.setState({ error: 'Must enter email and password' });
      return;
    }

    console.log(`Button clicked: ${this.state.email} ${this.state.password}`);
    console.log('Validated and ready to send to the API');

    this.login();
  }

  login() {
    const toSend = {
      email: this.state.email,
      password: this.state.password,
    };

    return fetch(
      'http://localhost:3333/api/1.0.0/login',
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSend),
      },
    )
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } if (response.status === 400) {
          throw 'Incorrect email and/or password';
        } else {
          throw 'Something went wrong';
        }
      })
      .then(async (rJson) => {
        console.log(rJson);
        try {
          await AsyncStorage.setItem('whatsthat_user_id', rJson.id);
          await AsyncStorage.setItem('whatsthat_session_token', rJson.token);

          this.setState({ submitted: false });

          this.setState({ success: true });
          setTimeout(() => {
            this.setState({ success: false });
            this.props.navigation.navigate('Tab');
          }, 1000);
        } catch {
          throw 'Something went wrong';
        }
      })
      .catch((error) => {
        this.setState({ error });
        this.setState({ submitted: false });
      });
  }

  render() {
    return (
      <View style={styles.container}>

        <View>
          <View style={styles.email}>
            <Text style={{ marginStart: 10 }}>Email:</Text>
            <TextInput
              style={styles.textFields}
              placeholder="Enter email"
              onChangeText={(email) => this.setState({ email })}
              defaultValue={this.state.email}
            />

            <>
              {this.state.submitted && !this.state.email
                                && <Text style={styles.error}>*Email is required</Text>}
            </>
          </View>

          <View style={styles.password}>
            <Text style={{ marginStart: 10 }}>Password:</Text>
            <TextInput
              style={styles.textFields}
              placeholder="Enter password"
              onChangeText={(password) => this.setState({ password })}
              defaultValue={this.state.password}
              secureTextEntry
            />

            <>
              {this.state.submitted && !this.state.password
                                && <Text style={styles.error}>*Password is required</Text>}
            </>
          </View>

          <View>
            <TouchableOpacity onPress={this.onPressButton}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
              </View>
            </TouchableOpacity>
          </View>

          <>
            {this.state.success
                            && <Text style={styles.success}>Login Successful</Text>}
          </>

          <>
            {this.state.error
                            && <Text style={styles.error}>{this.state.error}</Text>}
          </>

          <View>
            <Text onPress={() => this.props.navigation.navigate('Signup')} style={styles.signup}>Need an account?</Text>
          </View>
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
  email: {
    marginBottom: 5,
  },
  password: {
    marginBottom: 10,
  },
  signup: {
    justifyContent: 'center',
    textDecorationLine: 'underline',
    marginLeft: 10,
  },
  button: {
    marginBottom: 30,
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
  error: {
    color: 'red',
    fontWeight: '900',
    marginLeft: 10,
  },
  success: {
    color: 'green',
    fontWeight: '900',
    marginLeft: 10,
  },
  textFields: {
    height: 35,
    borderWidth: 1,
    width: '80%',
    alignSelf: 'center',
  },
});
