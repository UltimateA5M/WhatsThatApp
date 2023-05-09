import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';

export default class ChatOptions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chat_id: '',
      message_id: '',
      messageText: '',
      submitted: 'false',
      error: '',
    };

    this.onPressButton = this.onPressButton.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();

      this.setState({
        chat_id: this.props.route.params.chat_id,
        message_id: this.props.route.params.data.item.message_id,
        messageText: this.props.route.params.data.item.message,
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onPressButton() {
    this.setState({ submitted: true });
    this.setState({ error: '' });

    if (!(this.state.messageText)) {
      this.setState({ error: 'Text cannot be blank!' });
      return;
    }

    console.log('Validated and ready to send to the API');

    this.updateMessage();
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null) {
      this.props.navigation.navigate('Login');
    }
  };

  async updateMessage() {
    const toSend = {};

    toSend.message = this.state.messageText;

    return fetch(`http://localhost:3333/api/1.0.0/chat/${this.state.chat_id}/message/${this.state.message_id}`, {
      method: 'PATCH',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toSend),
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('message updated');
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
        this.setState({ error });
        this.setState({ submitted: false });
      });
  }

  async deleteMessage() {
    return fetch(`http://localhost:3333/api/1.0.0/chat/${this.state.chat_id}/message/${this.state.message_id}`, {
      method: 'DELETE',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          console.log('Message Deleted');
        } else if (response.status === 403) {
          throw 'Forbidden';
        } else if (response.status === 401) {
          throw 'Unauthorized';
        } else if (response.status === 404) {
          throw 'Not Found';
        } else {
          throw 'Server Error';
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    console.log(`CHAT ID:${this.state.chat_id}MSG ID:${this.state.message_id}${this.state.messageText}`);
    return (
      <View style={styles.container}>
        <Text style={{ marginLeft: 10 }}>message:</Text>
        <TextInput
          style={{ height: 40, borderWidth: 1, marginTop: 10, width: '80%', alignSelf: 'center' }}
          defaultValue={this.state.messageText}
          onChangeText={(messageText) => this.setState({ messageText })}
        />

        <>
          {this.state.submitted && !this.state.messageText
          && <Text style={styles.error}>{this.state.error}</Text>}
        </>

        <TouchableOpacity onPress={() => this.onPressButton()}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Update Message</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.deleteMessage()}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Delete Message</Text>
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
    width: '35%',
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
