import React, { Component } from 'react';
import {
  Text, View, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Image,
} from 'react-native';
import { FlatList } from 'react-native-web';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class ContactsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: '',
      isLoading: true,
      searched: false,
      showContacts: true,
      userData: [],
      photo: {},
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({ searched: false, showContacts: true, isLoading: true });
      this.checkLoggedIn();
      this.getContacts();
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

  async getContacts() {
    return fetch('http://localhost:3333/api/1.0.0/contacts', {
      method: 'get',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('contacts fetched successfully');
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

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null) {
      this.props.navigation.navigate('Login');
    }
  };

  async searchContacts() {
    return fetch(`http://localhost:3333/api/1.0.0/search?q=${this.state.searchValue}&search_in=contacts`, {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('contacts fetched successfully');
          return response.json();
        } if (response.status === 401) {
          console.log('Unauthorized');
        } else {
          console.log('Server Error');
        }
      })
      .then((responseJson) => {
        this.setState({
          searched: true,
          showContacts: false,
          userData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async blockUser(userId) {
    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/block`, {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          console.log('user blocked');
          this.getContacts();
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

  async deleteContact(userId) {
    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/contact`, {
      method: 'DELETE',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          console.log('Contact Removed');
          this.getContacts();
          return response.json();
        } if (response.status === 400) {
          throw "You can't remove yourself as a contact";
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
            renderItem={(contact) => {
              this.getProfileImage(contact.item.user_id);
            }}
            keyExtractor={(contact) => contact.user_id}
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
          placeholder="Search..."
          onChangeText={(searchValue) => this.setState({ searchValue })}
          defaultValue={this.state.searchValue}
        />

        <View>
          <TouchableOpacity onPress={() => this.searchContacts()}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Search</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('BlockedContacts')}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>View Blocked Contacts</Text>
            </View>
          </TouchableOpacity>
        </View>

        <FlatList
          data={this.state.userData}
          renderItem={(contact) => (
            <View style={{ marginLeft: 10 }}>

              { this.state.searched
                      && (
                      <>
                        <Image source={{ uri: this.state.photo[contact.item.user_id] }} style={{ width: 50, height: 50, alignSelf: 'flex-start' }} />
                        <Text>
                          {contact.item.given_name}
                          {' '}
                          {contact.item.family_name}
                        </Text>
                      </>
                      )}

              { this.state.showContacts
                      && (
                      <>
                        <Image source={{ uri: this.state.photo[contact.item.user_id] }} style={{ width: 50, height: 50, alignSelf: 'flex-start' }} />
                        <Text>
                          {' '}
                          {contact.item.first_name}
                          {' '}
                          {contact.item.last_name}
                        </Text>
                      </>
                      )}

              <TouchableOpacity onPress={() => this.blockUser(contact.item.user_id)}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Block</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => this.deleteContact(contact.item.user_id)}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Remove</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(contact) => contact.user_id}
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
