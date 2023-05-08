import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, FlatList,
} from 'react-native';
import { ActivityIndicator } from 'react-native-web';

export default class ChatsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      chatsData: [],
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.getChats();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  async getChats() {
    return fetch('http://localhost:3333/api/1.0.0/chat', {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('chats fetched successfully');
          return response.json();
        } if (response.status === 401) {
          console.log('Unauthorized');
        } else {
          console.log('Server Error');
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          chatsData: responseJson,
        });
        console.log(responseJson);
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

    const result = `${day}/${month}/${year} ${hours}:${minutes}`;

    return result;
  }

  render() {
    if (this.state.isLoading) {
      <View>
        <ActivityIndicator />
      </View>;
    }
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => this.props.navigation.navigate('NewChatScreen')}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>+Chat</Text>
          </View>
        </TouchableOpacity>

        <FlatList
          data={this.state.chatsData}
          renderItem={(chat) => (
            <View style={{ marginTop: 10 }}>

              <TouchableOpacity onPress={() => this.props.navigation.navigate('ViewChatScreen', { data: chat })}>
                <View style={{ marginStart: 10 }}>
                  <Text>{chat.item.name}</Text>
                  <Text>
                    {' '}
                    {chat.item.last_message.message}
                  </Text>
                  <Text>
                    {' '}
                    {` ${this.timestampConverter(chat.item.last_message.timestamp)}`}
                    {' '}
                  </Text>
                </View>
              </TouchableOpacity>

            </View>
          )}
          keyExtractor={(chat) => chat.chat_id}
        />

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
});
