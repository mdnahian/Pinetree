import React, { Component } from 'react';
import {
	View,
	Text,
	Image,
	ScrollView,
	Linking,
	TouchableHighlight
} from 'react-native';
import styles from '../../styles/styles';
import Store from 'react-native-store';

var Profile = require('../components/profile.js');
var MapView = require('react-native-maps');

const DB = {
    'settings': Store.model('settings'),
    'coordinates': Store.model('coordinates'),
    'location': Store.model('location')
}

module.exports = React.createClass({
	componentDidMount: function () {

		DB.settings.find().then(resp => {
			if(resp != null && resp[resp.length - 1].user != "") {
				this.setState({
					user: resp[resp.length - 1].user,
					counter: resp[resp.length - 1].counter,
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

		DB.location.find().then(resp => {
			if(resp != null && resp[resp.length - 1].latitude != ""){
				this.setState({
					longitude: resp[resp.length - 1].longitude,
					latitude: resp[resp.length - 1].latitude,
				});
			}
		});  

		DB.coordinates.find().then(resp => {
			if(resp != null){
				this.setState({
					coordinates: Array.prototype.slice.call(resp)
				});
			}
		});

	},
	getInitialState: function () {
		return {
			user: '',
			counter: '3',
			longitude: 0,
			latitude: 0,
			coordinates: []
		}
	},
	render: function () {
		return <View style={styles.container}>
			<View style={styles.header}>
				<TouchableHighlight style={styles.logoholder} onPress={this.back} underlayColor={'#eeeeee'}>
					<Image style={styles.logo} source={require('../../img/backbtn.png')}/>
				</TouchableHighlight>
				<Text style={styles.title}>Settings</Text>
			</View>
			<View style={styles.navigationview}>

				<MapView style={styles.item} region={{
					latitude: this.state.latitude,
				    longitude: this.state.longitude,
					latitudeDelta: 0.1922,
					longitudeDelta: 0.1821,
				}}>

					{this.state.coordinates.map(marker => (
					    <MapView.Marker
					    	key={marker.name}
					    	coordinate={{latitude: marker.latitude, longitude: marker.longitude}}
					    	title={marker.name}/>))}

				</MapView>

				<ScrollView style={[styles.item, {padding:25}]}>
					<Text style={styles.subtitle}>My Account</Text>

					<View style={{flexDirection:'row'}}>
						<Text style={{flex: 2, padding: 10}}>Username: <Text style={{fontWeight: 'bold'}}>{this.state.user}</Text></Text>
						<View style={{flex: 1, alignItems: 'flex-end'}}>
							<TouchableHighlight style={styles.btn} onPress={this.generateNewUsername} underlayColor={'#588A32'}>
								<Text>REGENERATE</Text>
							</TouchableHighlight>
						</View>
					</View>

					<Text style={{padding: 10}}>You may change your username {this.state.counter} more times.</Text> 
					

					<View style={{flexDirection:'row', marginTop: 15}}>
						<Text style={{flex: 2, padding: 10}}>Membership: <Text style={{fontWeight: 'bold'}}>Free</Text></Text>
						<View style={{flex: 1, alignItems: 'flex-end'}}>
							<TouchableHighlight style={[styles.btn, {backgroundColor:'#eeeeee'}]} underlayColor={'#dedede'} onPress={() => this.openUrl("http://pinetreemobile.com/premium")}>
								<Text>GET PREMIUM</Text>
							</TouchableHighlight>
						</View>
					</View>

					<Text style={{padding: 10}}>Premium members can customize their username and will be more noticeable than guest users.</Text>

				</ScrollView>


			</View>
		</View>
	},
	generateNewUsername: function () {
		if (parseInt(this.state.counter) > 0) {
			var user = Profile();

			DB.settings.add({
			    user: user,
			    counter: (parseInt(this.state.counter) - 1).toString()
		    });

		    this.setState({
		    	user: user,
		    	counter: (parseInt(this.state.counter) - 1).toString()
		    });	
		}
	},
	openUrl: function (url) {
		Linking.canOpenURL(url).then(supported => {
	      if (supported) {
	        Linking.openURL(url);
	      } else {
	        console.log('Don\'t know how to open URI: ' + url);
	      }
	    });
	},
	back: function () {
		this.props.isRight = true;
		this.props.navigator.jumpBack(0);
	}
});