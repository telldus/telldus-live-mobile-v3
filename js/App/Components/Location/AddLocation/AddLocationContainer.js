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
 */

// @flow

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { BackHandler, ImageBackground, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');

import {
	View,
	DialogueBox,
	Text,
	RoundedInfoButton,
	NavigationHeaderPoster,
} from '../../../../BaseComponents';
import Theme from '../../../Theme';

import * as modalActions from '../../../Actions/Modal';
import * as gatewayActions from '../../../Actions/Gateways';

import i18n from '../../../Translations/common';

type Props = {
	navigation: Object,
	children: Object,
	actions?: Object,
	screenProps: Object,
	showModal: boolean,
	validationMessage: any,
	source: Object | number,
	ScreenName: string,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	loading: boolean,
};

type DefaultProps = {
	source: Object | number,
};

class AddLocationContainer extends View<null, Props, State> {

	handleBackPress: () => boolean;

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		children: PropTypes.object.isRequired,
		actions: PropTypes.objectOf(PropTypes.func),
		screenProps: PropTypes.object,
		showModal: PropTypes.bool,
		validationMessage: PropTypes.any,
		source: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
	};

	static defaultProps: DefaultProps = {
		source: {uri: 'telldus_geometric_bg'},
	};

	state = {
		h1: '',
		h2: '',
		infoButton: null,
	};

	constructor(props: Props) {
		super(props);

		this.backButton = {
			back: true,
			onPress: this.goBack,
		};
		const { formatMessage } = props.screenProps.intl;

		this.dlogPOne = `${formatMessage(i18n.dialogueBodyParaOne)}.`;
		this.dlogPTwo = `${formatMessage(i18n.dialogueBodyParaTwo)}.`;
		this.dlogPThree = `${formatMessage(i18n.dialogueBodyParaThree)}.`;

		this.dialogueHeader = formatMessage(i18n.dialogueHeader);

		this.closeModal = this.closeModal.bind(this);
		this.handleBackPress = this.handleBackPress.bind(this);
		this.getRelativeData = this.getRelativeData.bind(this);
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress(): boolean {
		let {navigation, screenProps} = this.props;
		if (screenProps.currentScreen === 'Success') {
			return true;
		}
		navigation.pop();
		return true;
	}


	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		if (nextProps.ScreenName === nextProps.screenProps.currentScreen) {
			const isStateEqual = isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}
			const isPropsEqual = isEqual(this.props, nextProps);
			if (!isPropsEqual) {
				return true;
			}
			return false;
		}
		return false;
	}

	onChildDidMount = (h1: string, h2: string, infoButton?: Object | null = null) => {
		this.setState({
			h1,
			h2,
			infoButton,
		});
	};

	closeModal = () => {
		this.props.actions.hideModal();
	};

	renderCustomDialogueHeader(styles: Object): Object {
		let buttonProps = {
			infoButtonContainerStyle: styles.infoButtonContainer,
		};
		return (
			<ImageBackground style={styles.dialogueHeader} source={this.props.source}>
				<RoundedInfoButton buttonProps={buttonProps}/>
				<Text style={styles.dialogueHeaderText}>
					{this.dialogueHeader}
				</Text>
			</ImageBackground>
		);
	}

	renderCustomBody(styles: Object): Object {
		return (
			<View style={styles.dialogueBody}>
				<Text style={styles.dialogueBodyText}>
					{'\n'}{this.dlogPOne}{'\n'}
				</Text>
				<Text style={styles.dialogueBodyText}>
					{this.dlogPTwo}{'\n'}
				</Text>
				<Text style={styles.dialogueBodyText}>
					{this.dlogPThree}
				</Text>
			</View>
		);
	}

	getRelativeData = (styles: Object): Object => {
		let {modalExtras, validationMessage, screenProps} = this.props;
		const { formatMessage } = screenProps.intl;
		if (modalExtras.source && modalExtras.source === 'Position') {
			return {
				dialogueHeader: this.renderCustomDialogueHeader(styles),
				validationMessage: this.renderCustomBody(styles),
				positiveText: formatMessage(i18n.dialoguePositiveText).toUpperCase(),
			};
		}
		return {
			dialogueHeader: false,
			validationMessage: validationMessage,
			positiveText: false,
		};
	};

	render(): Object {
		const {
			children,
			actions,
			screenProps,
			showModal,
			navigation,
		} = this.props;
		const { currentScreen, appLayout } = screenProps;
		const { h1, h2, infoButton } = this.state;
		const { height, width } = appLayout;
		const isPortrait = height > width;

		const deviceWidth = isPortrait ? width : height;

		const styles = this.getStyle(appLayout);

		let padding = currentScreen === 'TimeZoneCity'
			|| currentScreen === 'TimeZoneContinent' ? 0 : (deviceWidth * Theme.Core.paddingFactor);
		const { dialogueHeader, validationMessage, positiveText } = this.getRelativeData(styles);

		return (
			<View style={{
				flex: 1,
			}}>
				<KeyboardAvoidingView
					behavior="padding"
					style={{flex: 1}}
					contentContainerStyle={{ justifyContent: 'center'}}
					keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}>
					<NavigationHeaderPoster
						h1={h1} h2={h2}
						infoButton={infoButton}
						showLeftIcon={currentScreen !== 'Success'}
						align={'right'}
						navigation={navigation}
						{...screenProps}
						leftIcon={currentScreen === 'LocationDetected' ? 'close' : undefined}/>
					<ScrollView style={{
						flex: 1,
						backgroundColor: Theme.Core.appBackground,
					}} keyboardShouldPersistTaps={'always'} contentContainerStyle={{flexGrow: 1}}>
						<View style={[styles.style, {paddingHorizontal: padding}]}>
							{React.cloneElement(
								children,
								{
									onDidMount: this.onChildDidMount,
									actions,
									...screenProps,
									navigation,
									dialogueOpen: showModal,
									paddingHorizontal: padding,
								},
							)}
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
				<DialogueBox
					dialogueContainerStyle={{elevation: 0}}
					header={dialogueHeader}
					showDialogue={showModal}
					text={validationMessage}
					showPositive={true}
					positiveText={positiveText}
					onPressPositive={this.closeModal}/>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;

		return {
			style: {
				flex: 1,
			},
			dialogueHeader: {
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center',
				paddingLeft: 20,
				height: isPortrait ? height * 0.08 : width * 0.08,
				width: isPortrait ? width * 0.75 : height * 0.75,
			},
			infoButtonContainer: {
				position: 'relative',
				right: 0,
				bottom: 0,
			},
			dialogueHeaderText: {
				textAlign: 'center',
				textAlignVertical: 'center',
				color: '#fff',
				fontSize: isPortrait ? Math.floor(width * 0.042) : Math.floor(height * 0.042),
				paddingLeft: 10,
			},
			dialogueBody: {
				justifyContent: 'center',
				alignItems: 'flex-start',
				paddingLeft: 20,
				paddingRight: 10,
				width: isPortrait ? width * 0.75 : height * 0.75,
			},
			dialogueBodyText: {
				color: '#A59F9A',
				fontSize: isPortrait ? Math.floor(width * 0.042) : Math.floor(height * 0.042),
				textAlign: 'left',
			},
		};
	}
}

const mapStateToProps = (store: Object): Object => (
	{
		showModal: store.modal.openModal,
		validationMessage: store.modal.data,
		modalExtras: store.modal.extras,
	}
);

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({...modalActions, ...gatewayActions}, dispatch),
		},
	}
);

export default connect(mapStateToProps, mapDispatchToProps)(AddLocationContainer);
