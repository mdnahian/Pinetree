import React, { Component } from 'react';
import {
	Navigator
} from 'react-native';

var Main = require('./pages/main');
var Settings = require('./pages/settings');
var SignIn = require('./pages/signin');
var SignUp = require('./pages/signup');

var ROUTES = {
	main: Main,
	settings: Settings,
	signin: SignIn,
	signup: SignUp
};

module.exports = React.createClass({
	componentWillMount: function () {
		var config = {
			apiKey: "AIzaSyArPDhAnJXd4OALLbzKPj8vMzMTFOp7Ajo",
			authDomain: "pinetree-12116.firebaseapp.com",
			databaseURL: "https://pinetree-12116.firebaseio.com",
			storageBucket: "pinetree-12116.appspot.com",
		};
		firebase.initializeApp(config);
	},
	renderScene: function (route, navigator) {
		var Component = ROUTES[route.name];
		return <Component route={route} navigator={navigator} />
	},
	render: function () {
		return <Navigator style={{flex: 1}}
		initialRoute={{name: 'main'}}
		renderScene={this.renderScene}
		configScence={() => { return Navigator.SceneConfigs.FloatFromRight; }} />
	}
});