import React from 'react';
import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
	container: {
		flex: 1,
		marginTop: (Platform.OS === 'ios') ? 20 : 0,
	},
	header: {
		backgroundColor: '#eeeeee',
		flexDirection: 'row',
		borderColor: '#cccccc',
		borderBottomWidth: 1,
		height: 64,
		justifyContent: 'center',
		alignItems: 'center'
	},
	logoholder: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	logo: {
		width: 36,
		height: 36
	},
	title: {
		flex: 5,
		color: '#999999',
		fontSize: 18,
		alignItems: 'center',
		paddingLeft: 10
	},
	settingsbtn: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	settings: {
		width: 24,
		height: 24,
		justifyContent: 'flex-end',
		alignItems: 'flex-end'
	},
	messageview: {
		flex: 1,
		backgroundColor: '#dedede'
	},
	messagebar: {
		padding: 10,
		backgroundColor: '#eeeeee',
		flexDirection: 'row',
		borderColor: '#cccccc',
		borderTopWidth: 1
	},
	messageinput: {
		backgroundColor: '#ffffff',
		padding: 5,
		flex: 15,
		height: 40
	},
	sendbtn: {
		flex: 2,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor:'#dedede'
	},
	sendbtnimage: {
		width: 25,
		height: 25
	}, 
	message: {
		margin: 15,
		padding:10,
		borderRadius: 5
	},
	messagetxt: {
		fontSize: 18
	},
	messageuser: {
		marginTop: 5
	},
	mymessage: {
		backgroundColor: '#eeeeee',
		marginLeft: 100
	},
	othermessage: {
		backgroundColor: '#BCC951',
		marginRight: 100
	}
});