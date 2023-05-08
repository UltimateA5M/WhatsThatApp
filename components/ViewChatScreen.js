import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, TextInput, FlatList,
} from 'react-native';

export default class ViewChatScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      current_user_id: '',
      chat_id: '',
      messageToSend: '',
      error: '',
      chatData: {},
    };

    this.onPressButton = this.onPressButton.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();

      this.setState({
        chatData: this.props.route.params.data,
        chat_id: this.props.route.params.data.item.chat_id,
      });

      this.setUserId();
      this.loadChat(this.props.route.params.data.item.chat_id);
    });

    this.interval = setInterval(() => {
      this.loadChat(this.props.route.params.data.item.chat_id);
    }, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.unsubscribe();
  }

  onPressButton() {
    this.setState({ error: '' });

    if (!this.state.messageToSend) {
      this.setState({ error: 'Cannot send empty message' });
      return;
    }

    console.log('Validated and ready to send to the API');

    this.sendMessage();
  }

  async setUserId() {
    this.setState({ current_user_id: await AsyncStorage.getItem('whatsthat_user_id') });
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null) {
      this.props.navigation.navigate('Login');
    }
  };

  async loadChat(chatId) {
    return fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}`, {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('Chat Loaded');
          return response.json();
        } if (response.status === 401) {
          console.log('Unauthorized');
        } else if (response.status === 403) {
          console.log('Forbidden');
        } else if (response.status === 404) {
          console.log('Chat not found');
        } else {
          console.log('Server Error');
        }
      })
      .then((responseJson) => {
        this.setState({
          chatData: responseJson,
        });
        console.log(responseJson);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async sendMessage() {
    return fetch(`http://localhost:3333/api/1.0.0/chat/${this.props.route.params.data.item.chat_id}/message`, {
      method: 'post',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: this.state.messageToSend }),
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('Sent');
          this.loadChat(this.props.route.params.data.item.chat_id);
        } else if (response.status === 400) {
          console.log('Bad Request');
        } else if (response.status === 401) {
          console.log('Unauthorized');
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

  timestampConverter(timestamp) {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    let minutes = date.getMinutes();

    if (date.getMinutes() < 10) {
      minutes = `0${minutes}`;
    }

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  render() {
    return (
      <View style={styles.container}>

        <View>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('ChatOptions', { data: this.state.chatData, chat_id: this.state.chat_id })}>
            {/* <View style={styles.button}>
                <Text style={styles.buttonText}>Chat Options</Text>
              </View> */}
            <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 24 }}>
              {' '}
              {this.state.chatData.name}
              {' '}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={this.state.chatData.messages}
          renderItem={(message) => {
            if (message.item.author.user_id == this.state.current_user_id) {
              return (
                <View style={{ alignSelf: 'flex-end', margin: 15 }}>
                  {/* <Text> {JSON.stringify(message)} </Text> */}
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('MessageOptions', { data: message, chat_id: this.state.chat_id, chatObj: this.state.chatData })}>
                    <Text>
                      {' '}
                      {message.item.author.first_name}
                      :
                      {' '}
                      {message.item.message}
                    </Text>
                    <Text>
                      {' '}
                      {this.timestampConverter(message.item.timestamp) }
                      {' '}
                    </Text>
                    <Text>
                      {' '}
                      {' '}
                      {' '}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }

            return (
              <View style={{ margin: 10 }}>
                <Text>
                  {' '}
                  {message.item.author.first_name}
                  :
                  {' '}
                  {message.item.message}
                </Text>
                <Text>
                  {' '}
                  {this.timestampConverter(message.item.timestamp) }
                  {' '}
                </Text>
                <Text>
                  {' '}
                  {' '}
                  {' '}
                </Text>
              </View>
            );
          }}
          // eslint-disable-next-line no-unused-vars
          keyExtractor={(message, index) => message.message_id}
          inverted
        />

        <>
          {this.state.error
                && <Text style={styles.error}>{this.state.error}</Text>}
        </>

        <View>
          <TouchableOpacity onPress={() => this.onPressButton()}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Send</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TextInput
          style={{
            height: 35, borderWidth: 1, marginBottom: 20, marginLeft: 5, marginRight: 5, width: '70%', alignSelf: 'flex-start',
          }}
          placeholder="Enter Message.."
          onChangeText={(messageToSend) => this.setState({ messageToSend })}
          defaultValue={this.state.messageToSend}
        />

        {/* <Button style={styles.button} onPress={() => this.sendMessage()} title="Send" /> */}

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
    backgroundColor: '#2196F3',
    width: '20%',
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  buttonText: {
    textAlign: 'center',
    padding: 15,
    color: 'white',
  },
  error: {
    color: 'red',
    fontWeight: '900',
  },
});
