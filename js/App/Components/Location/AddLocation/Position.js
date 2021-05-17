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
import { announceForAccessibility } from 'react-native-accessibility';

import { View, Text, RoundedInfoButton, GeometricHeader } from '../../../../BaseComponents';
import GeoPosition from '../Common/GeoPosition';

import capitalize from '../../../Lib/capitalize';
import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
	intl: Object,
	onDidMount: Function,
	actions: Object,
	navigation: Object,
	dispatch: Function,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	route: Object,

	toggleDialogueBox: (Object) => void,
};

type State = {
	isLoading: boolean,
};

class Position extends View {
	props: Props;
	state: State;

	onSubmit: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: false,
		};

		let { formatMessage } = props.intl;

		this.h1 = capitalize(formatMessage(i18n.headerOnePosition));
		this.h2 = formatMessage(i18n.headerTwoPosition);

		this.unknownError = `${formatMessage(i18n.unknownError)}.`;

		this.labelMessageToAnnounce = `${formatMessage(i18n.screen)} ${this.h1}. ${this.h2}`;

		this.infoButton = {
			onPress: this.onInfoPress.bind(this),
		};

		this.onSubmit = this.onSubmit.bind(this);

		this.dlogPOne = `${formatMessage(i18n.dialogueBodyParaOne)}.`;
		this.dlogPTwo = `${formatMessage(i18n.dialogueBodyParaTwo)}.`;
		this.dlogPThree = `${formatMessage(i18n.dialogueBodyParaThree)}.`;

		this.dialogueHeader = formatMessage(i18n.dialogueHeader);

	}

	componentDidMount() {
		const { h1, h2, infoButton} = this;
		this.props.onDidMount(h1, h2, infoButton);

		let { screenReaderEnabled } = this.props;
		if (screenReaderEnabled) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { screenReaderEnabled, currentScreen } = this.props;
		let shouldAnnounce = currentScreen === 'Position' && prevProps.currentScreen !== 'Position';
		if (screenReaderEnabled && shouldAnnounce) {
			announceForAccessibility(this.labelMessageToAnnounce);
		}
	}

	onInfoPress() {
		const { intl } = this.props;
		const header = this.renderCustomDialogueHeader();
		this.openDialogueBox({
			header,
			text: `${this.dlogPOne}\n\n${this.dlogPTwo}\n\n${this.dlogPThree}`,
			positiveText: intl.formatMessage(i18n.dialoguePositiveText),
		});
	}

	renderCustomDialogueHeader(): Object {
		const styles = this.getStyle();
		let buttonProps = {
			infoButtonContainerStyle: styles.infoButtonContainer,
		};
		return (
			<View style={{
				height: styles.headerHeight,
				width: styles.headerWidth,
				overflow: 'hidden',
				borderTopRadius: 5,
				justifyContent: 'center',
				alignItems: 'center',
			}}>
				<GeometricHeader headerHeight={styles.headerHeight} headerWidth={styles.headerWidth} style={{
					marginTop: -2, // TODO: this is a work around for a very narrow line shown on top
					// of the image. Investigate and give a proper fix.
				}}/>
				<View style={styles.dialogueHeader}>
					<RoundedInfoButton buttonProps={buttonProps}/>
					<Text style={styles.dialogueHeaderText}>
						{this.dialogueHeader}
					</Text>
				</View>
			</View>
		);
	}

	openDialogueBox(otherConfs: Object = {}) {
		const { toggleDialogueBox } = this.props;
		const dialogueData = {
			show: true,
			showHeader: true,
			closeOnPressPositive: true,
			dialogueContainerStyle: {elevation: 0},
			showPositive: true,
			...otherConfs,
		};
		toggleDialogueBox(dialogueData);
	}

	onSubmit(latitude: number, longitude: number) {
		this.setState({
			isLoading: true,
		});
		const { navigation, actions, route } = this.props;
		let { clientInfo } = route.params || {};
		clientInfo.coordinates = { latitude, longitude };
		actions.activateGateway(clientInfo)
			.then(async (response: Object) => {
				try {
					await actions.getGateways();
				} catch (e) {
					// Ignore
				} finally {
					navigation.navigate('Success', {clientInfo});
					this.setState({
						isLoading: false,
					});
				}
			}).catch((error: Object) => {
				let message = error.message ? (error.message === 'Network request failed' ? this.networkFailed : error.message) :
					error.error ? error.error : this.unknownError;
				this.openDialogueBox({
					text: message,
				});
				this.setState({
					isLoading: false,
				});
			});
	}

	render(): Object {
		return (
			<GeoPosition
				{...this.props}
				isLoading={this.state.isLoading}
				onSubmit={this.onSubmit}
			/>
		);
	}

	getStyle(): Object {
		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const {
			fontSizeFactorTwelve,
		} = Theme.Core;

		return {
			dialogueHeader: {
				paddingLeft: 20,
				flex: 1,
				justifyContent: 'flex-start',
				alignItems: 'center',
				flexDirection: 'row',
				position: 'absolute',
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
			},
			headerHeight: isPortrait ? height * 0.08 : width * 0.08,
			headerWidth: isPortrait ? width * 0.75 : height * 0.75,
			infoButtonContainer: {
				position: 'relative',
				right: 0,
				bottom: 0,
			},
			dialogueHeaderText: {
				textAlign: 'center',
				textAlignVertical: 'center',
				color: '#fff',
				fontSize: Math.floor(deviceWidth * fontSizeFactorTwelve),
				paddingLeft: 10,
			},
		};
	}
}

export default (Position: Object);
