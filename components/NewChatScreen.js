import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';

export default class NewChatScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chatName: '',
      error: '',
      submitted: false,
    };

    this.onPressButton = this.onPressButton.bind(this);
    this.newChat = this.newChat.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onPressButton() {
    this.setState({ submitted: true });
    this.setState({ error: '' });

    if (!(this.state.chatName)) {
      this.setState({ error: 'Must enter a name for the chat' });
      return;
    }

    console.log('Validated and ready to send to the API');

    this.newChat();
    this.props.navigation.navigate('Chats');
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null) {
      this.props.navigation.navigate('Login');
    }
  };

  async newChat() {
    return fetch('http://localhost:3333/api/1.0.0/chat', {
      method: 'post',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: this.state.chatName }),
    })
      .then((response) => {
        if (response.status === 201) {
          console.log('Chat Created');
          return response.json();
        } if (response.status === 400) {
          console.log('Bad Request');
        } else if (response.status === 401) {
          console.log('Unauthorized');
        } else {
          console.log('Server Error');
        }
      })
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({ submitted: false });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ error });
        this.setState({ submitted: false });
      });
  }

  render() {
    return (
      <View style={styles.container}>

        <TextInput
          style={{
            height: 40, borderWidth: 1, marginTop: 10, width: '80%', alignSelf: 'center',
          }}
          placeholder="Chat Name..."
          onChangeText={(chatName) => this.setState({ chatName })}
          defaultValue={this.state.chatName}
        />

        <>
          {this.state.submitted && !this.state.chatName
          && <Text style={styles.error}>{this.state.error}</Text>}
        </>

        <TouchableOpacity onPress={this.onPressButton}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Create Chat</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.props.navigation.navigate('Chats')}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Back</Text>
          </View>
        </TouchableOpacity>

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
    marginBottom: 10,
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
});
