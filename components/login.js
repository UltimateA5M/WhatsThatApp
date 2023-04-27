import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default class LoginScreen extends Component {

    constructor(props){
        super(props);

        this.state = {
            email: "asim@gmail.com",
            password: "Password123!",
            error: "", 
            submitted: false
        }

        this._onPressButton = this._onPressButton.bind(this)
    }

    login(){
        let to_send = {
            email: this.state.email,
            password: this.state.password
        };

        return fetch("http://localhost:3333/api/1.0.0/login",
        {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(to_send)
        })
        .then((response) => {
            if(response.status === 200){
                return response.json();
            }else if(response.status === 400){
                throw "Incorrect email and/or password"
            }else{
                throw "Something went wrong"
            }
        })
        .then(async (rJson) => {
            console.log(rJson)
            try{
                await AsyncStorage.setItem("whatsthat_user_id", rJson.id)
                await AsyncStorage.setItem("whatsthat_session_token", rJson.token)

                this.setState({"submitted": false});

                this.props.navigation.navigate('Tab')
            }catch{
                throw "Something went wrong"
            }
        })
        .catch((error) => {
            this.setState({"error": error})
            this.setState({"submitted": false});
        });
    }

    _onPressButton(){
        this.setState({submitted: true})
        this.setState({error: ""})

        if(!(this.state.email && this.state.password)){
            this.setState({error: "Must enter email and password"})
            return;
        }

        console.log("Button clicked: " + this.state.email + " " + this.state.password)
        console.log("Validated and ready to send to the API")

        this.login()
    }

    render(){
        return (
            <View style={styles.container}>

                <View>
                    <View style={styles.email}>
                        <Text>Email:</Text>
                        <TextInput
                            style={{height: 40, borderWidth: 1, width: "100%"}}
                            placeholder="Enter email"
                            onChangeText={email => this.setState({email})}
                            defaultValue={this.state.email}
                        />

                        <>
                            {this.state.submitted && !this.state.email &&
                                <Text style={styles.error}>*Email is required</Text>
                            }
                        </>
                    </View>
            
                    <View style={styles.password}>
                        <Text>Password:</Text>
                        <TextInput
                            style={{height: 40, borderWidth: 1, width: "100%"}}
                            placeholder="Enter password"
                            onChangeText={password => this.setState({password})}
                            defaultValue={this.state.password}
                            secureTextEntry
                        />

                        <>
                            {this.state.submitted && !this.state.password &&
                                <Text style={styles.error}>*Password is required</Text>
                            }
                        </>
                    </View>
            
                    <View>
                        <TouchableOpacity onPress={this._onPressButton}>
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>Login</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <>
                        {this.state.error &&
                            <Text style={styles.error}>{this.state.error}</Text>
                        }
                    </>
            
                    <View>
                        <Text onPress={() => this.props.navigation.navigate('Signup')} style={styles.signup}>Need an account?</Text>
                    </View>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      alignItems: "stretch",
      justifyContent: "center",
    },
    email:{
      marginBottom: 5
    },
    password:{
      marginBottom: 10
    },
    signup:{
      justifyContent: "center",
      textDecorationLine: "underline"
    },
    button: {
      marginBottom: 30,
      backgroundColor: '#2196F3',
      width: '50%',
      alignSelf: "center"
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