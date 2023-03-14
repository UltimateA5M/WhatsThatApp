import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default class addContactButton extends Component {

    constructor(props){
        super(props);

        this.state = {
            error: "", 
            submitted: false
        }

        this._onPressButton = this._onPressButton.bind(this)
    }

    async addContact(){
        const user_id = "";

        return fetch("http://localhost:3333/api/1.0.0/user/"+ user_id + "/contact", {
            method: "POST",
            headers: {
                "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
            }
        })
        .then(async (response) => {
            if(response.status === 200){
                return response.json();
            }else if(response.status === 400){
                throw "You can't add yourself as a contact"
            }else if(response.status === 401){
                throw "Unauthorized"
            }else if(response.status === 404){
                throw "Not Found"
            }else{
                throw "Server Error"
            }
        })
        .catch((error) => {
            this.setState({"error": error})
            this.setState({"submitted": false});
        })
    }

    _onPressButton(){
        this.setState({submitted: true})
        this.setState({error: ""})

        this.addContact()
    }

    render(){
        return (
            <View>
                <TouchableOpacity onPress={this._onPressButton}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Add</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "80%",
        alignItems: "stretch",
        justifyContent: "center"
    },
    button: {
        marginBottom: 30,
        backgroundColor: '#2196F3'
    },
    buttonText: {
        textAlign: 'center',
        padding: 20,
        color: 'white'
    },
    error: {
        color: "red",
        fontWeight: '900'
    }
  });