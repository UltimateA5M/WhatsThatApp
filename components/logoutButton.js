import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default class logoutButton extends Component {

    constructor(props){
        super(props);

        this.state = {
            error: "", 
            submitted: false
        }

        this._onPressButton = this._onPressButton.bind(this)
    }

    async logout(){
        console.log("Logout")

        return fetch("http://localhost:3333/api/1.0.0/logout", {
            method: "POST",
            headers: {
                "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
            }
        })
        .then(async (response) => {
            if(response.status === 200){
                await AsyncStorage.removeItem("whatsthat_session_token")
                await AsyncStorage.removeItem("whatsthat_user_id")
                this.props.navigation.navigate("Login")
            }else if(response.status === 401){
                console.log("Unauthorised")
                await AsyncStorage.removeItem("whatsthat_session_token")
                await AsyncStorage.removeItem("whatsthat_user_id")
                this.props.navigation.navigate("Login")
            }else{
                throw "Something went wrong"
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

        this.logout()
    }

    render(){
        return (
            <View>
                <TouchableOpacity onPress={this._onPressButton}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Logout</Text>
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