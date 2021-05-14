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
import { Linking, Platform } from 'react-native';
import { intlShape } from 'react-intl';
import { announceForAccessibility } from 'react-native-accessibility';
import { connect } from 'react-redux';

import {
	CommonActions,
} from '@react-navigation/native';

import Theme from '../../../Theme';
import {
	View,
	Text,
	Image,
	Icon,
	TouchableButton,
} from '../../../../BaseComponents';

import getLocationImageUrl from '../../../Lib/getLocationImageUrl';

import capitalize from '../../../Lib/capitalize';

import i18n from '../../../Translations/common';

type Props = {
	intl: intlShape.isRequired,
	navigation: Object,
	onDidMount: Function,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	route: Object,
	allIds: Array<string>,
};

type State = {
};

class Success extends View<void, Props, State> {

	onPressHelp: () => void;
	onPressContinue: () => void;

	constructor(props: Props) {
		super(props);
		this.link = 'http://live.telldus.com/help/guides';
		this.onPressHelp = this.onPressHelp.bind(this);

		let { formatMessage } = props.intl;

		this.h1 = capitalize(formatMessage(i18n.LSheaderOne));
		this.h2 = formatMessage(i18n.LSheaderTwo);

		this.title = `${formatMessage(i18n.messageTitle)}!`;
		this.body = formatMessage(i18n.messageBodyParaOne);

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);

		let { screenReaderEnabled } = this.props;
		if (screenReaderEnabled) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { screenReaderEnabled, currentScreen } = this.props;
		let shouldAnnounce = currentScreen === 'Success' && prevProps.currentScreen !== 'Success';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'Success';
	}

	navigateToTabs = () => {
		const { navigation, route } = this.props;
		const { clientInfo } = route.params || {};

		let routes = [{ name: 'Tabs' }];
		let _routes = [
			{
				name: 'Dashboard',
			},
			{
				name: 'Devices',
			},
			{
				name: 'Sensors',
			},
			{
				name: 'Scheduler',
			},
		];
		if (Platform.OS === 'ios') {
			_routes.push({
				name: 'MoreOptionsTab',
			});
		}
		if (Platform.OS === 'ios') {
			routes = [
				{
					name: 'Tabs',
					state: {
						index: 4,
						routes: _routes,
					},
				},
				{
					name: 'Gateways',
				},
			];
		}
		routes = [
			...routes,
			{
				name: 'InfoScreen',
				params: {
					info: 'add_device',
					clientId: clientInfo.clientId,
				},
			},
		];
		const resetAction = CommonActions.reset({
			index: 1,
			routes,
		});
		navigation.dispatch(resetAction);
	}

	navigateToCopy = () => {
		const { navigation, route } = this.props;
		navigation.navigate('CopyDevicesAndSchedules', {
			...route.params,
		});
	}

	navigate = () => {
		const { allIds } = this.props;

		if (allIds.length > 1) {
			this.navigateToCopy();
			return;
		}

		this.navigateToTabs();
	}

	onPressContinue = () => {
		this.navigateToTabs();
	}

	onPressHelp() {
		let url = this.link;
		Linking.canOpenURL(url).then((supported: boolean): any => {
			if (!supported) {
			  console.log(`Can't handle url: ${url}`);
			} else {
			  return Linking.openURL(url);
			}
		  }).catch((err: Object) => {
			  console.error('An error occurred', err);
		  });
	}

	render(): Object {
		const { appLayout, route, allIds, intl } = this.props;

		const hasOtherGateways = allIds.length > 1;

		const styles = this.getStyle({
			appLayout,
			hasOtherGateways,
		});

		const { clientInfo } = route.params || {};
		const locationImageUrl = getLocationImageUrl(clientInfo.type);

		return (
			<View style={{
				flex: 1,
				alignItems: 'stretch',
			}}>
				<View
					level={2}
					style={styles.itemsContainer}>
					<View style={styles.imageTitleContainer}>
						<Image resizeMode="contain" style={styles.imageLocation} source={{uri: locationImageUrl, isStatic: true}} />
						<View style={styles.iconCheckCover}>
							<View
								level={2}
								style={styles.iconBackMask}/>
							<Icon
								level={31}
								name="check-circle"
								size={styles.iconCheckSize}
								style={styles.iconCheck}/>
						</View>
						<View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
							<Text
								level={18}
								style={styles.messageTitle}>
								{this.title}
							</Text>
						</View>
					</View>
					<Text style={styles.messageBody}>
						{this.body}
						{/** {'\n\n'}
							TODO: Bring back this when guides are available in live-v3
							<FormattedMessage {...i18n.messageBodyParaTwo} style={styles.messageBody}/>
							*/}
					</Text>
					{/** <TouchableOpacity onPress={this.onPressHelp} style={styles.hyperLinkButton}>
							<CustomIcon name="icon_guide" size={36} color={Theme.Core.brandSecondary} />
							<FormattedMessage {...i18n.hyperLintText} style={styles.hyperLink}/>
							<Icon name="angle-right" size={26} color={'#A59F9A'}/>
						</TouchableOpacity> */}
				</View>
				{hasOtherGateways && <TouchableButton
					text={'COPY DEVICES FROM OTHER GATEWAY'}
					onPress={this.navigateToCopy}
					style={styles.button}
				/>}
				<TouchableButton
					text={hasOtherGateways ? 'CONTINUE WITHOUT COPYING' : intl.formatMessage(i18n.continue)}
					onPress={this.onPressContinue}
					style={styles.button}
				/>
			</View>
		);
	}

	getStyle({
		appLayout,
		hasOtherGateways,
	}: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const {
			fontSizeFactorTwelve,
		} = Theme.Core;

		const iconCheckSize = deviceWidth * 0.13;
		const iconContCheckSize = iconCheckSize * 0.96;

		const {
			paddingFactor,
			shadow,
		} = Theme.Core;

		const padding = deviceWidth * paddingFactor;

		return {
			iconCheckSize: iconCheckSize,
			itemsContainer: {
				flexDirection: 'column',
				marginTop: 20,
				paddingVertical: 20,
				paddingRight: 20,
				alignItems: 'flex-start',
				...shadow,
			},
			imageLocation: {
				width: deviceWidth * 0.32,
				height: deviceWidth * 0.23,
			},
			imageTitleContainer: {
				flex: 1,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'flex-start',
			},
			iconCheckCover: {
				flex: 0,
				position: 'absolute',
				top: 22,
				left: deviceWidth * 0.18,
			},
			iconBackMask: {
				top: iconContCheckSize * 0.09,
				position: 'absolute',
				width: iconContCheckSize * 0.9,
				height: iconContCheckSize * 0.9,
				borderRadius: iconContCheckSize * 0.45,
			},
			iconCheck: {
				position: 'absolute',
				backgroundColor: 'transparent',
			},
			messageTitle: {
				fontSize: Math.floor(deviceWidth * 0.068),
				flexWrap: 'wrap',
			},
			messageBody: {
				marginLeft: 20,
				marginTop: 10,
				color: '#A59F9A',
				fontSize: Math.floor(deviceWidth * fontSizeFactorTwelve),
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
				width: hasOtherGateways ? deviceWidth * 0.9 : undefined,
				maxWidth: deviceWidth * 0.9,
				alignSelf: 'center',
				marginTop: padding,
			},
		};
	}
}

const mapStateToProps = (store: Object): Object => {

	const {
		allIds,
	} = store.gateways;

	return {
		allIds,
	};
};

export default (connect(mapStateToProps, null)(Success): Object);
