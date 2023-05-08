import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Image,
} from 'react-native';

export default class ChatOptions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chat_id: '',
      chatName: '',
      isLoading: true,
      chatData: {},
      photo: {},
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();

      this.setState({
        chatData: this.props.route.params.data,
        chat_id: this.props.route.params.chat_id,
        chatName: this.props.route.params.data.name,
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  async getProfileImage(userId) {
    fetch(`http://localhost:3333/api/1.0.0/user/${userId}/photo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'image/jpeg',
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then((response) => response.blob())
      .then((responseBlob) => {
        const data = URL.createObjectURL(responseBlob);

        this.setState((prevState) => ({
          photo: { ...prevState.photo, [userId]: data },
          isLoading: false,
        }));
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

  async updateChatInfo() {
    return fetch(`http://localhost:3333/api/1.0.0/chat/${this.state.chat_id}`, {
      method: 'PATCH',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: this.state.chatName }),
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('Name Updated');
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

  async removeUser(userId) {
    return fetch(`http://localhost:3333/api/1.0.0/chat/${this.state.chat_id}/user/${userId}`, {
      method: 'DELETE',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          console.log('User Removed');
        } else if (response.status === 401) {
          throw 'Unauthorized';
        } else if (response.status === 403) {
          throw 'Forbidden';
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
    if (this.state.isLoading) {
      return (
        <View>
          <FlatList
            data={this.state.chatData.members}
            renderItem={(member) => {
              this.getProfileImage(member.item.user_id);
            }}
            keyExtractor={(member) => member.user_id}
          />
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={styles.container}>

        <TextInput
          style={{
            height: 40, borderWidth: 1, marginTop: 10, width: '80%', alignSelf: 'center',
          }}
          placeholder="Enter Chat Name.."
          onChangeText={(chatName) => this.setState({ chatName })}
          defaultValue={this.state.chatName}
        />

        <View>
          <TouchableOpacity onPress={() => this.updateChatInfo()}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Update</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text> User Management </Text>

        <FlatList
          data={this.state.chatData.members}
          renderItem={(member) => (
            <View style={{ marginLeft: 10, marginTop: 10 }}>

              <TouchableOpacity onPress={() => this.removeUser(member.item.user_id)}>
                <Image source={{ uri: this.state.photo[member.item.user_id] }} style={{ width: 50, height: 50, alignSelf: 'flex-start' }} />
                <Text>
                  {' '}
                  { member.item.first_name }
                  {' '}
                  { member.item.last_name }
                  {' '}
                </Text>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Remove</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(member) => member.user_id}
        />

        <TouchableOpacity onPress={() => this.props.navigation.navigate('AddUserToChat', { data: this.state.chatData, chat_id: this.state.chat_id })}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Add User To Chat</Text>
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
    width: '30%',
    borderRadius: 4,
    alignSelf: 'center',
  },
  buttonText: {
    textAlign: 'center',
    padding: 20,
    color: 'white',
  },
});
