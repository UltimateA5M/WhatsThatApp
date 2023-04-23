import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, CameraType } from 'expo-camera';
import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, } from 'react-native';

export default function CameraScreen({route, navigation}){
    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [camera, setCamera] = useState(null);

    function toggleCameraType(){
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
        console.log("Camera: ", type)
    }

    async function takePhoto(){
        if(camera){
            const options = {quality: 0.5, base64: true, onPictureSaved: (data) => sendToServer(data)}
            const data = await camera.takePictureAsync(options)

            console.log(data.uri)
        }
    }

    async function sendToServer(data){
        let id = route.params.data.user_id;

        let res = await fetch(data.base64);
        let blob = await res.blob()
        
        return fetch("http://localhost:3333/api/1.0.0/user/"+ id + "/photo", {
            method: "post",
            headers: {
                "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token"),
                "Content-Type": "image/png"
            },
            body: blob
        })
        .then((response) => {
            if(response.status === 200){
                console.log("profile updated");
            }else if(response.status === 400){
                console.log("Bad Request");
            }else if(response.status === 401){
                console.log("Unauthorised");
            }else if(response.status === 403){
                console.log("Forbidden");
            }else if(response.status === 404){
                console.log("Not Found");
            }else{
                console.log("Server Error");
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }

    return(
        <View style={styles.container}>
            <Camera style={styles.camera} type={type} ref= {ref => setCamera(ref)}>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity type={type} onPress={toggleCameraType}>
                        <Text style={styles.text}> Flip Camera</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity type={type} onPress={takePhoto}>
                        <Text style={styles.text}> Take Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                    <View style={styles.button}>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                            <Text style={styles.text}> Back </Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </Camera>
        </View>
    );
  
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    buttonContainer: {
        alignSelf: 'flex-end',
        padding: 5,
        margin: 5,
        backgroundColor: 'steelblue'
    },
    button: {
        width: '100%',
        height: '100%'
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ddd'
    }
})