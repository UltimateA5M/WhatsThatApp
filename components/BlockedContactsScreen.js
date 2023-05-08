import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Image,
} from 'react-native';

export default class BlockedContactsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      userData: [],
      photo: {},
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.getBlockedUsers();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  async getBlockedUsers() {
    return fetch('http://localhost:3333/api/1.0.0/blocked', {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('users fetched successfully');
          return response.json();
        } if (response.status === 401) {
          console.log('Unauthorized');
        } else {
          console.log('Server Error');
        }
      })
      .then((responseJson) => {
        this.setState({
          userData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async getProfileImage(userId) {
    fetch(`http://localhost:3333/api/1.0.0/user/${userId}/photo`, {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.blob();
        }
        throw 'Something went wrong';
      })
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

  async unblockContact(userId) {
    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/block`, {
      method: 'DELETE',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          console.log('user unblocked');
          return response.json();
        } if (response.status === 400) {
          throw "You can't block yourself";
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
    if (this.state.isLoading) {
      return (
        <View>
          <FlatList
            data={this.state.userData}
            renderItem={(user) => {
              this.getProfileImage(user.item.user_id);
            }}
            keyExtractor={(user) => user.user_id}
          />
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={styles.container}>

        <FlatList
          data={this.state.userData}
          renderItem={(user) => (
            <View style={{ marginTop: 10, marginLeft: 10 }}>
              <Image source={{ uri: this.state.photo[user.item.user_id] }} style={{ width: 50, height: 50, alignSelf: 'flex-start' }} />
              <Text>
                Name:
                {' '}
                {user.item.first_name}
                {' '}
                {user.item.last_name}
              </Text>
              <Text>
                Email:
                {' '}
                {user.item.email}
              </Text>
              <TouchableOpacity onPress={() => this.unblockContact(user.item.user_id)}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Unblock</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(user) => user.user_id}
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
    marginBottom: 10,
    marginRight: 10,
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
});
