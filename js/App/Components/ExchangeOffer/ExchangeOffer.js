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
 */
// @flow
'use strict';

import React from 'react';
import { TouchableOpacity, Modal, ScrollView, Linking } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';

import {
	View,
	Text,
	StyleSheet,
	PosterWithText,
	NavigationHeader,
	SafeAreaView,
} from '../../../BaseComponents';
import Block from './SubViews/Block';

import Theme from '../../Theme';
import i18n from '../../Translations/common';
import {
	toggleVisibilityExchangeOffer,
} from '../../Actions';
import shouldUpdate from '../../Lib/shouldUpdate';
import capitalize from '../../Lib/capitalize';

type Props = {
	showModal: boolean,
	intl: Object,
	onLayout: (Object) => void,
	appLayout: Object,
	toggleVisibilityExchangeOffer: ('show' | 'hide_temp' | 'hide_perm' | 'force_show') => void,
	navigation: Object,
};

class ExchangeOffer extends View<Props, null> {
props: Props;

constructor(props: Props) {
	super(props);
	let { formatMessage } = this.props.intl;
	this.eula = formatMessage(i18n.eula);
	this.header = formatMessage(i18n.userAgreementHeaderPhrase, {eula: this.eula});
	this.footer = formatMessage(i18n.iAgree);

	this.h1 = capitalize(formatMessage(i18n.labelExchangeProgram));
	this.h2 = `${formatMessage(i18n.labelUpgradeGateway)}!`;

	this.f1 = formatMessage(i18n.labelReadAndOrder);
	this.f2 = formatMessage(i18n.labelNotNow);
	this.f3 = formatMessage(i18n.labelDontShowAgain);

	this.BLOCKS = [
		{
			h1: formatMessage(i18n.exchangeOfferH1),
			body: formatMessage(i18n.exchangeOfferBody),
			img: require('../TabViews/img/exchange/exchange_one.jpg'),
			addTextOne: `${formatMessage(i18n.labelMsrp, {
				value: '1299 SEK',
			})}`,
			addTextTwo: `${formatMessage(i18n.labelFreeShipping)}!`,
		},
		{
			h1: formatMessage(i18n.exchangeOfferOneH1),
			h2: formatMessage(i18n.exchangeOfferOneH2),
			body: formatMessage(i18n.exchangeOfferOneBody),
			img: require('../TabViews/img/exchange/exchange_two.jpg'),
		},
		{
			h1: formatMessage(i18n.exchangeOfferTwoH1),
			h2: formatMessage(i18n.exchangeOfferTwoH2),
			body: formatMessage(i18n.exchangeOfferTwoBody),
			img: require('../TabViews/img/exchange/exchange_three.jpg'),
		},
		{
			h1: formatMessage(i18n.exchangeOfferEndTitle),
			body: formatMessage(i18n.exchangeOfferEndBody),
		},
	];
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const propsChange = shouldUpdate(this.props, nextProps, ['showModal', 'appLayout']);
	if (propsChange) {
		return true;
	}

	return false;
}

navigateToExchange = () => {
	const url = 'https://live.telldus.com/help/exchangeNetG1';
	const defaultMessage = this.props.intl.formatMessage(i18n.errorMessageOpenExchange);
	Linking.canOpenURL(url)
		.then((supported: boolean): any => {
			if (!supported) {
				this.showDialogue(defaultMessage);
			} else {
				return Linking.openURL(url);
			}
		})
		.catch((err: any) => {
			const message = err.message || defaultMessage;
			this.showDialogue(message);
		});
}

hidePerm = () => {
	this.props.toggleVisibilityExchangeOffer('hide_perm');
}

hideTemp = () => {
	this.props.toggleVisibilityExchangeOffer('hide_temp');
}

render(): Object | null {
	const { showModal, appLayout, navigation } = this.props;

	const styles = this.getStyles(appLayout);

	const blocks = this.BLOCKS.map((b: Object, i: number): Function => {
		return <Block key={`${i}`} {...b} appLayout={appLayout} index={i}/>;
	});

	return (
		<Modal
			visible={showModal}
			transparent={false}
			animationType={'slide'}
			presentationStyle={'fullScreen'}
			onRequestClose={this.noOP}
			supportedOrientations={['portrait', 'landscape']}>
			<SafeAreaView onLayout={this.props.onLayout}>
				<NavigationHeader showLeftIcon={false} topMargin={false} forceHideStatus/>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.SVContentContainerStyle}>
					<PosterWithText
						appLayout={appLayout}
						align={'left'}
						h1={this.h1}
						h2={this.h2}
						navigation={navigation}/>
					{blocks}
				</ScrollView>
				<View style={styles.footersCover}>
					<View
						level={13}
						style={styles.footerOne}>
						<TouchableOpacity style={styles.footerItem} onPress={this.navigateToExchange}>
							<Text style={[styles.footerText, {color: '#fff'}]}>
								{this.f1}
							</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.footerTwo}>
						<TouchableOpacity style={styles.footerItem} onPress={this.hidePerm}>
							<Text
								level={23}
								style={styles.footerText}>
								{this.f3}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.footerItem} onPress={this.hideTemp}>
							<Text
								level={23}
								style={styles.footerText}>
								{this.f2}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		</Modal>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const footerHeight = Math.floor(deviceWidth * 0.26);

	const {
		eulaContentColor,
		fontSizeFactorFour,
	} = Theme.Core;

	return {
		footerHeight,
		hContainer: {
			position: 'absolute',
			right: isPortrait ? width * 0.1 : height * 0.1,
			top: isPortrait ? width * 0.088 : height * 0.088,
			flex: 1,
			alignItems: 'flex-end',
		},
		h: {
			color: '#fff',
			backgroundColor: 'transparent',
		},
		h1: {
			fontSize: isPortrait ? width * 0.08 : height * 0.08,
		},
		h2: {
			fontSize: isPortrait ? width * 0.053333333 : height * 0.053333333,
		},
		scrollView: {
			flex: 1,
			marginBottom: footerHeight > 100 ? 100 : footerHeight,
		},
		SVContentContainerStyle: {
			flexGrow: 1,
			alignItems: 'center',
		},
		footersCover: {
			position: 'absolute',
			alignItems: 'flex-end',
			justifyContent: 'center',
			width: '100%',
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: '#00000040',
			height: footerHeight,
			maxHeight: 100,
			bottom: 0,
		},
		footerOne: {
			width: '100%',
			alignItems: 'center',
			justifyContent: 'center',
			height: footerHeight / 2,
			maxHeight: 100,
		},
		footerTwo: {
			width: '100%',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			backgroundColor: '#FAFAFA',
			height: footerHeight / 2,
			maxHeight: 100,
		},
		footerItem: {
			padding: 10,
			alignItems: 'center',
			justifyContent: 'center',
		},
		footerText: {
			fontSize: Math.floor(deviceWidth * fontSizeFactorFour),
			fontWeight: 'bold',
		},
		markupStyle: {
			heading: {
				color: eulaContentColor,
			},
			text: {
				color: eulaContentColor,
			},
			heading1: {
				fontSize: 28,
			},
		},
	};
}

noOP() {
}
}

function mapDispatchToProps(dispatch: Function, ownProps: Object): Object {
	return {
		...bindActionCreators({
			toggleVisibilityExchangeOffer,
		}, dispatch),
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	return {
		appLayout: store.app.layout,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(injectIntl(ExchangeOffer)): Object);
