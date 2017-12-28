/**
 * Copyright 2016-present Telldus Technologies AB.
 *
 * This file is part of the Telldus Live! app.
 *
 * Telldus Live! app is free : you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Telldus Live! app is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

// @flow

'use strict';

import React from 'react';
import { Linking, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { defineMessages, intlShape } from 'react-intl';

import Theme from 'Theme';
import {
	View,
	Text,
	Image,
	Icon,
	TouchableButton,
} from 'BaseComponents';

import getLocationImageUrl from '../../Lib/getLocationImageUrl';

const messages = defineMessages({
	headerOne: {
		id: 'addNewLocation.success.headerOne',
		defaultMessage: 'Congratulations',
		description: 'Main header for the add location success Screen',
	},
	headerTwo: {
		id: 'addNewLocation.success.headerTwo',
		defaultMessage: 'Location added successfully',
		description: 'Secondary header for the add location success Screen',
	},
	messageTitle: {
		id: 'addNewLocation.success.messageTitle',
		defaultMessage: 'Welcome to your smart home',
		description: 'Message Title for the add location success Screen',
	},
	messageBodyParaOne: {
		id: 'addNewLocation.success.messageBodyParaOne',
		defaultMessage: 'You have now taken the first step towards your smart home! ' +
		'Now you can start adding devices, view sensors, schedule devices and events and much more.',
		description: 'Message Body for the add location success Screen Para One',
	},
	messageBodyParaTwo: {
		id: 'addNewLocation.success.messageBodyParaTwo',
		defaultMessage: 'If you want help or would like to learn tips and tricks on how to setup your smart home you ' +
		'can view our guides by clicking below',
		description: 'Message Body for the add location success Screen Para two',
	},
	hyperLintText: {
		id: 'addNewLocation.success.hyperLintText',
		defaultMessage: 'Guides',
		description: 'Hyper link button text',
	},
	continue: {
		id: 'button.success.continue',
		defaultMessage: 'CONTINUE',
		description: 'Button Text',
	},
});

type Props = {
	intl: intlShape.isRequired,
	navigation: Object,
	onDidMount: Function,
	rootNavigator: Object,
	appLayout: Object,
}

type State = {
}

class Success extends View<void, Props, State> {

	onPressHelp: () => void;
	onPressContinue: () => void;

	constructor(props: Props) {
		super(props);
		this.link = 'http://live.telldus.com/help/guides';
		this.onPressHelp = this.onPressHelp.bind(this);
		this.onPressContinue = this.onPressContinue.bind(this);

		this.h1 = props.intl.formatMessage(messages.headerOne);
		this.h2 = props.intl.formatMessage(messages.headerTwo);

		this.title = `${props.intl.formatMessage(messages.messageTitle)}!`;
		this.body = props.intl.formatMessage(messages.messageBodyParaOne);
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'Success';
	}

	onPressContinue() {
		this.props.rootNavigator.navigate('Tabs');
	}

	onPressHelp() {
		let url = this.link;
		Linking.canOpenURL(url).then(supported => {
			if (!supported) {
			  console.log(`Can't handle url: ${url}`);
			} else {
			  return Linking.openURL(url);
			}
		  }).catch(err => console.error('An error occurred', err));
	}

	render() {
		let { appLayout } = this.props;
		const styles = this.getStyle(appLayout);

		let clientInfo = this.props.navigation.state.params.clientInfo;
		let locationImageUrl = getLocationImageUrl(clientInfo.type);

		return (
			<View style={{flex: 1}}>
				<ScrollView>
					<View style={[styles.itemsContainer, styles.shadow]}>
						<View style={styles.imageTitleContainer}>
							<Image resizeMode="contain" style={styles.imageLocation} source={{uri: locationImageUrl, isStatic: true}} />
							<Icon name="check-circle" size={44} style={styles.iconCheck} color={Theme.Core.brandSuccess}/>
							<View style={{flex: 1, flexWarp: 'wrap'}}>
								<Text style={styles.messageTitle}>
									{this.title}
								</Text>
							</View>
						</View>
						<Text style={styles.messageBody}>
							{this.body}
							{/** {'\n\n'}
							TODO: Bring back this when guides are available in live-v3
							<FormattedMessage {...messages.messageBodyParaTwo} style={styles.messageBody}/>
							*/}
						</Text>
						{/** <TouchableOpacity onPress={this.onPressHelp} style={styles.hyperLinkButton}>
							<CustomIcon name="icon_guide" size={36} color={Theme.Core.brandSecondary} />
							<FormattedMessage {...messages.hyperLintText} style={styles.hyperLink}/>
							<Icon name="angle-right" size={26} color={'#A59F9A'}/>
						</TouchableOpacity> */}
					</View>
					<TouchableButton
						text={this.props.intl.formatMessage(messages.continue)}
						onPress={this.onPressContinue}
						style={styles.button}
					/>
				</ScrollView>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		const isPortrait = height > width;

		return {
			itemsContainer: {
				flex: 1,
				flexDirection: 'column',
				marginTop: 20,
				paddingVertical: 20,
				paddingRight: 20,
				alignItems: 'flex-start',
				width: width - 20,
			},
			shadow: {
				borderRadius: 4,
				backgroundColor: '#fff',
				shadowColor: '#000000',
				shadowOffset: {
					width: 0,
					height: 0,
				},
				shadowRadius: 1,
				shadowOpacity: 1.0,
				elevation: 2,
			},
			imageLocation: {
				width: isPortrait ? width * 0.32 : height * 0.32,
				height: isPortrait ? width * 0.23 : height * 0.23,
			},
			imageTitleContainer: {
				flex: 1,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'flex-start',
			},
			iconCheck: {
				position: 'absolute',
				top: 20,
				left: isPortrait ? width * 0.18 : height * 0.18,
				backgroundColor: '#fff',
				borderBottomLeftRadius: 35,
				borderTopRightRadius: 25,
			},
			messageTitle: {
				color: '#00000099',
				fontSize: isPortrait ? Math.floor(width * 0.068) : Math.floor(height * 0.068),
				flexWrap: 'wrap',
			},
			messageBody: {
				marginLeft: 20,
				marginTop: 10,
				color: '#A59F9A',
				fontSize: isPortrait ? Math.floor(width * 0.042) : Math.floor(height * 0.042),
			},
			hyperLinkButton: {
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center',
				marginTop: 10,
				height: 40,
				width: 130,
			},
			hyperLink: {
				color: '#00000099',
				fontSize: 22,
				marginLeft: 5,
				marginRight: 5,
			},
			button: {
				alignSelf: 'center',
				marginTop: 20,
				marginBottom: 10,
			},
		};
	}
}

export default connect()(Success);
