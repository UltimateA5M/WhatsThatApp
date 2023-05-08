/* eslint-disable max-len */
/* eslint-disable eqeqeq */
/* eslint-disable react/no-access-state-in-setstate */
import React, { Component } from 'react';
import {
  Text, View, Image, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput,
} from 'react-native';
import { FlatList } from 'react-native-web';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class SearchScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: '',
      offset: 0,
      limit: 3,
      showUsers: false,
      isLoading: true,
      userData: [],
      photo: {},
      error: '',
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
      this.setState({ showUsers: false, error: '' });
      this.search();
    });
  }

  componentWillUnmount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({ userData: [], showUsers: false, searchValue: '' });
    });
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

  async search() {
    return fetch(`http://localhost:3333/api/1.0.0/search?q=${this.state.searchValue}&limit=${this.state.limit}&offset=${this.state.offset}`, {
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
          showUsers: true,
        });
        console.log(responseJson);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async addContact(userId) {
    return fetch(`http://localhost:3333/api/1.0.0/user/${userId}/contact`, {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          return response.json();
        } if (response.status === 400) {
          this.setState({ error: "You can't add yourself as a contact" });
          throw "You can't add yourself as a contact";
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

  increaseOffsetVal() {
    if (this.state.userData.length < this.state.limit) {
      console.log('End of array reached');
    } else {
      this.setState({ offset: this.state.offset + this.state.limit, isLoading: true }, () => this.search());
    }
    console.log(this.state.offset);
  }

  decreaseOffsetVal() {
    if (this.state.offset > 0) {
      this.setState({ offset: this.state.offset - this.state.limit, isLoading: true }, () => this.search());
    } else {
      console.log('Start of array reached');
      this.setState({ offset: 0 });
    }
    console.log(this.state.offset);
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
        <TextInput
          style={{
            height: 40, borderWidth: 1, marginTop: 10, width: '80%', alignSelf: 'center',
          }}
          placeholder="Search..."
          onChangeText={(searchValue) => this.setState({ searchValue })}
          defaultValue={this.state.searchValue}
        />

        <View>
          <TouchableOpacity onPress={() => this.search()}>
            <View style={styles.searchButton}>
              <Text style={styles.buttonText}>Search</Text>
            </View>
          </TouchableOpacity>
        </View>

        <>
          {this.state.error != '' && <Text style={styles.error}>{this.state.error}</Text>}
        </>

        { this.state.showUsers

            && (
            <FlatList
              data={this.state.userData}
              renderItem={(user) => (
                <View style={{ marginLeft: 10 }}>
                  <Image source={{ uri: this.state.photo[user.item.user_id] }} style={{ width: 50, height: 50, alignSelf: 'flex-start' }} />
                  <Text>
                    Name:
                    {user.item.given_name}
                    {' '}
                    {user.item.family_name}
                  </Text>
                  <Text>
                    Email:
                    {user.item.email}
                  </Text>
                  <TouchableOpacity onPress={() => this.addContact(user.item.user_id)}>
                    <View style={styles.button}>
                      <Text style={styles.buttonText}>Add</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(user) => user.user_id}
            />
            )}

        { this.state.offset > 0

            && (
            <View>
              <TouchableOpacity onPress={() => this.decreaseOffsetVal()}>
                <View style={styles.searchButton}>
                  <Text style={styles.buttonText}>Back</Text>
                </View>
              </TouchableOpacity>
            </View>
            )}

        { this.state.userData.length == this.state.limit

            && (
            <View>
              <TouchableOpacity onPress={() => this.increaseOffsetVal()}>
                <View style={styles.searchButton}>
                  <Text style={styles.buttonText}>Next</Text>
                </View>
              </TouchableOpacity>
            </View>
            )}

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
  searchButton: {
    marginBottom: 40,
    marginTop: 10,
    backgroundColor: '#2196F3',
    width: '25%',
    length: '10%',
    borderRadius: 4,
    alignSelf: 'center',
  },
  button: {
    marginTop: 10,
    marginRight: 10,
    backgroundColor: '#2196F3',
    width: '25%',
    length: '10%',
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  buttonText: {
    textAlign: 'center',
    padding: 20,
    color: 'white',
  },
  error: {
    color: 'red',
    fontWeight: '900',
  },
});
