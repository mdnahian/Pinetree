import React, { Component } from 'react';
import {
	View,
	Text,
	Image,
	TextInput,
	ScrollView,
	DeviceEventEmitter,
	TouchableHighlight
} from 'react-native';
import { RNLocation as Location } from 'NativeModules';
import TimerMixin from 'react-timer-mixin';
import styles from '../styles/styles';

var Dimensions = require('Dimensions');

var firebase = require('firebase');
var Api = require('./components/api.js');

var _scrollView: ScrollView;

var isLoaded = false;

module.exports = React.createClass({
	mixins: [TimerMixin],
	componentWillMount: function () {

		var config = {
			apiKey: "AIzaSyArPDhAnJXd4OALLbzKPj8vMzMTFOp7Ajo",
			authDomain: "pinetree-12116.firebaseapp.com",
			databaseURL: "https://pinetree-12116.firebaseio.com",
			storageBucket: "pinetree-12116.appspot.com",
		};
		firebase.initializeApp(config);

		firebase.auth().signInAnonymously().catch(function(error) {
			var errorCode = error.code;
			var errorMessage = error.message;
		});

	  	// Location.requestAlwaysAuthorization();
	  	Location.requestWhenInUseAuthorization();
    	Location.startUpdatingLocation();
	
		DeviceEventEmitter.addListener('locationUpdated', (location) => {
			if(location.latitude != null){ 
				Api(location.latitude, location.longitude)
			      .then((data) => {
			      	this.setState({
							latitude: location.latitude,
							longitude: location.longitude,
							city_state: data.city+", "+data.state,
							city_state_clean: (data.city+data.state).replace(" ", "")
					});

			      	if(!isLoaded){
				      	firebase.database().ref('posts/' + (data.city+data.state).replace(" ", "")).orderByKey().limitToLast(50).on('child_added', (snapshot) => {
							var messageList = this.sortMessages(snapshot.val());
							this.setState({
								messages: messageList
							});
						});
						isLoaded = true;
				    }

		    	});
			} else if(location.coords != null){
				Api(location.coords.latitude, location.coords.longitude)
			      .then((data) => {
			      	this.setState({
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
							city_state: data.city+", "+data.state,
							city_state_clean: (data.city+data.state).replace(" ", "")
					});

			      	if(!isLoaded){
				      	firebase.database().ref('posts/' + (data.city+data.state).replace(" ", "")).orderByKey().limitToLast(50).on('child_added', (snapshot) => {
							var messageList = this.sortMessages(snapshot.val());
							this.setState({
								messages: messageList
							});
						});
						isLoaded = true;
				    }


		    	});
			} else {
				
			}
		});

	},
	sortMessages: function (message) {
		var messageList = this.state.messages.concat([message]);

		messageList = messageList.sort(function(a, b){
			return parseFloat(a.date) - parseFloat(b.date);
		});

		return messageList;
	},
	getInitialState: function () {
		return {
			message: '',
			longitude: '',
			latitude: '',
			city_state: '',
			city_state_clean: '',
			user: 'guest1913',
			messages: []
		}
	},
	render: function () {
		return <View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>{this.state.city_state}</Text>
				<TouchableHighlight style={styles.settingsbtn}>
					<Image style={styles.settings} source={require('../img/settings.png')}/>
				</TouchableHighlight>
			</View>

			<ScrollView style={styles.messageview}
			ref={(scrollView) => { _scrollView = scrollView }}
			onContentSizeChange={(contentWidth, contentHeight) => {
					if(contentHeight > Dimensions.get('window').height) {
						_scrollView.scrollTo({
							y: contentHeight - Dimensions.get('window').height + 120
						})
					}	
				}
			}>
				{this.getMessages()}
			</ScrollView>

			<View style={styles.messagebar}>
			<TextInput 
				style={styles.messageinput}
				value={this.state.message}
				onChangeText={(text) => this.setState({message: text})}/>
				<TouchableHighlight style={styles.sendbtn} onPress={this.onPress} underlayColor={'#eeeeee'}>
					<Image style={styles.sendbtnimage} source={require('../img/send.png')}/>
				</TouchableHighlight>
			</View>
		</View>
	},
	getMessages: function () {
		return this.state.messages.map((message, id) => {
			var isMine = false;

			if(message.user == this.state.user){
				isMine = true;
			}

			return <View key={id} style={[styles.message, isMine ? styles.mymessage : styles.othermessage]}>
				<Text style={styles.messagetxt}>{message.message}</Text>
				<Text style={styles.messageuser}>{message.user}</Text>
			</View>
		});
	},
	generateStr: function() {
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 20; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	},
	onPress: function () {
		if(this.state.message != ""){
			
			firebase.database().ref("posts/" + this.state.city_state_clean +"/"+ this.generateStr()).set({
				message: this.state.message,
				longitude: this.state.longitude,
				latitude: this.state.latitude,
				city_state: this.state.city_state,
				city_state_clean: this.state.city_state_clean,
				user: this.state.user,
				date: (new Date()).getTime()
			});

		  	this.setState({message: ''});
		}

	}
});