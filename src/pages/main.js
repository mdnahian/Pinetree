import React, { Component } from 'react';
import {
	View,
	Text,
	Image,
	TextInput,
	ScrollView,
	Linking,
	DeviceEventEmitter,
	TouchableHighlight
} from 'react-native';
import { RNLocation as Location } from 'NativeModules';
import Spinner from 'react-native-loading-spinner-overlay';
import Store from 'react-native-store';
import styles from '../../styles/styles';

const DB = {
    'settings': Store.model('settings'),
    'coordinates': Store.model('coordinates'),
    'location': Store.model('location')
}

var Dimensions = require('Dimensions');

var firebase = require('firebase');
var Api = require('../components/api.js');
var Profile = require('../components/profile.js');

var _scrollView: ScrollView;

var isLoaded = false;

module.exports = React.createClass({
	componentWillMount: function () {

		DB.settings.find().then(resp => {
			if(resp != null && resp[resp.length - 1].user != "") {
				this.setState({
					user: resp[resp.length - 1].user,
					counter: resp[resp.length - 1].counter
				});
			} else {
				var user = Profile();

				DB.settings.add({
				    user: user,
				    counter: "3"
			    });

			    this.setState({
			    	user: user,
			    	counter: "3"
			    });
			}
		});

		firebase.auth().signInAnonymously().catch(function(error) {
			var errorCode = error.code;
			var errorMessage = error.message;
		});

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
				      	firebase.database().ref('posts/' + (data.city+data.state).replace(" ", "")).orderByKey().limitToLast(25).on('child_added', (snapshot) => {
							var messageList = this.sortMessages(snapshot.val());
							this.setState({
								messages: messageList
							});
							this.dismissLoadingEffect();
						});

				      	DB.coordinates.find().then(resp => {
				      		var isSaved = false;
				      		if(resp != null) {
				      			var coordinates = Array.prototype.slice.call(resp);
				      			
				      			for(var i=0; i<coordinates.length; i++){
					      			if(coordinates[i].name == (data.city+", "+data.state)){
					      				isSaved = true;
					      				break;
					      			}
					     		}

				      		} else {
				      			isSaved = false;
				      		}

				      		if(!isSaved){
				      			DB.coordinates.add({
				      				name: (data.city+", "+data.state),
				      				longitude: location.longitude,
				      				latitude: location.latitude,
				  					date: new Date()
			    				});
			      			}

				      	});

				      	DB.location.add({
						    longitude: location.longitude,
							latitude: location.latitude
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
							this.dismissLoadingEffect();
						});


				      	DB.coordinates.find().then(resp => {
				      		var isSaved = false;
				      		if(resp != null) {
				      			var coordinates = Array.prototype.slice.call(resp);
				      			
				      			for(var i=0; i<coordinates.length; i++){
					      			if(coordinates[i].name == (data.city+", "+data.state)){
					      				isSaved = true;
					      				break;
					      			}
					     		}

				      		} else {
				      			isSaved = false;
				      		}

				      		if(!isSaved){
				      			DB.coordinates.add({
				      				name: (data.city+", "+data.state),
				      				longitude: location.coords.longitude,
				      				latitude: location.coords.latitude,
				  					date: new Date()
			    				});
			      			}

				      	});

				      	DB.location.add({
						    longitude: location.coords.longitude,
							latitude: location.coords.latitude
						});

						isLoaded = true;
				    }

		    	});
			} else {
				// gps not found
			}
		});

		setTimeout(() => {
			this.dismissLoadingEffect();
		}, 5000);

	},
	componentDidMount: function () {
		
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
			user: '',
			messages: [],
			isLoadingVisible: true
		}
	},
	render: function () {
		return <View style={styles.container}> 

			<View style={styles.header}>
				<Text style={styles.title}>{this.state.city_state}</Text>
				<TouchableHighlight style={styles.settingsbtn} onPress={this.settings} underlayColor={'#eeeeee'}>
					<Image style={styles.settings} source={require('../../img/settings.png')}/>
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
				returnKeyType='go'
				style={styles.messageinput}
				value={this.state.message}
				onChangeText={(text) => this.setState({message: text})}
				onSubmitEditing={this.onPress}/>
				<TouchableHighlight style={styles.sendbtn} onPress={this.onPress} underlayColor={'#eeeeee'}>
					<Image style={styles.sendbtnimage} source={require('../../img/send.png')}/>
				</TouchableHighlight>
			</View>

			<Spinner visible={this.state.isLoadingVisible}/>
		</View>
	},
	getMessages: function () {
		return this.state.messages.map((message, id) => {
			var isMine = false;

			if(message.user == this.state.user){
				isMine = true;
			}

			return <View key={id} style={[styles.message, isMine ? styles.mymessage : styles.othermessage]}>
				<Text onPress={() => this.messagePressed(message.message)} style={styles.messagetxt}>{message.message}</Text>
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
	dismissLoadingEffect: function () {
		this.setState({
			isLoadingVisible: false
		})
	},
	showLoadingEffect: function () {
		this.setState({
			isLoadingVisible: true
		})
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
	},
	messagePressed: function (message) {
		var s = message.split(' ');
		for(var i=0; i<s.length; i++){
			this.openUrl(s[i]);
		}
	},
	openUrl: function (url) {
		try{
			Linking.canOpenURL(url).then(supported => {
		      if (supported) {
		        Linking.openURL(url);
		      } else {
		        console.log('Don\'t know how to open URI: ' + url);
		      }
		    });
		} catch (err){
			console.log('Don\'t know how to open URI: ' + url);
		}
		
	},
	settings: function () {
		this.showLoadingEffect();

		setTimeout(() => {
			this.props.navigator.push({
				name: 'settings',
			});
			this.dismissLoadingEffect();
		}, 500);
		
	}
});