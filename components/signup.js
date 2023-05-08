import React, { Component } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';

import * as EmailValidator from 'email-validator';

export default class SignupScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      error: '',
      success: false,
      submitted: false,
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

    if (!EmailValidator.validate(this.state.email)) {
      this.setState({ error: 'Must enter valid email' });
      return;
    }

    const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!PASSWORD_REGEX.test(this.state.password)) {
      this.setState({ error: "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)" });
      return;
    }

    console.log(`Button clicked: ${this.state.email} ${this.state.password}`);
    console.log('Validated and ready to send to the API');

    this.addUser();
  }

  addUser() {
    const toSend = {
      first_name: this.state.firstName,
      last_name: this.state.lastName,
      email: this.state.email,
      password: this.state.password,
    };

    return fetch(
      'http://localhost:3333/api/1.0.0/user',
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSend),
      },
    )
      .then((response) => {
        if (response.status === 201) {
          return response.json();
        } if (response.status === 400) {
          throw "Email already exists or password isn't strong enough";
        } else {
          throw 'Something went wrong';
        }
      })
      .then((rJson) => {
        console.log(rJson);
        this.setState({ error: 'User added successfully' });
        this.setState({ submitted: false });
        this.setState({ success: true });

        setTimeout(() => {
          this.setState({ success: false });
          this.props.navigation.navigate('Login');
        }, 3000);
      })
      .catch((error) => {
        this.setState({ error });
        this.setState({ submitted: false });
      });
  }

  render() {
    return (
      <View style={styles.container}>

        <View style={styles.formContainer}>
          <View style={{ marginBottom: 10, marginLeft: 10 }}>
            <Text>First Name: </Text>
            <TextInput
              style={{
                height: 40, borderWidth: 1, marginTop: 10, width: '80%', alignSelf: 'center',
              }}
              placeholder="Enter first name"
              onChangeText={(firstName) => this.setState({ firstName })}
              defaultValue={this.state.firstName}
            />

            <>
              {this.state.submitted && !this.state.firstName
                                && <Text style={styles.error}>*First Name is required</Text>}
            </>
          </View>

          <View style={{ marginBottom: 10, marginLeft: 10 }}>
            <Text>Last Name: </Text>
            <TextInput
              style={{
                height: 40, borderWidth: 1, marginTop: 10, width: '80%', alignSelf: 'center',
              }}
              placeholder="Enter last name"
              onChangeText={(lastName) => this.setState({ lastName })}
              defaultValue={this.state.lastName}
            />

            <>
              {this.state.submitted && !this.state.lastName
                                && <Text style={styles.error}>*Last Name is required</Text>}
            </>
          </View>

          <View style={styles.email}>
            <Text>Email:</Text>
            <TextInput
              style={{
                height: 40, borderWidth: 1, marginTop: 10, width: '80%', alignSelf: 'center',
              }}
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
            <Text>Password:</Text>
            <TextInput
              style={{
                height: 40, borderWidth: 1, marginTop: 10, width: '80%', alignSelf: 'center',
              }}
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

          <View style={styles.signupbtn}>
            <TouchableOpacity onPress={this.onPressButton}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Create Account </Text>
              </View>
            </TouchableOpacity>
          </View>

          <>
            {this.state.success
                            && <Text style={styles.success}>Sign Up Successful</Text>}
          </>

          <>
            {this.state.error
                            && <Text style={styles.error}>{this.state.error}</Text>}
          </>
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
  formContainer: {

  },
  email: {
    marginBottom: 10,
    marginLeft: 10,
  },
  password: {
    marginBottom: 10,
    marginLeft: 10,
  },
  signupbtn: {

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
});
