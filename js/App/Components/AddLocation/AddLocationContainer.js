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

import React, { PropTypes } from 'react';
import {BackAndroid} from 'react-native';
import { intlShape, injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import { View, Dimensions, StyleSheet, Modal } from 'BaseComponents';
import NotificationComponent from '../PreLoginScreens/SubViews/NotificationComponent';
import { AddLocationPoster } from 'AddNewLocation_SubViews';

import * as modalActions from 'Actions_Modal';

import Theme from 'Theme';

const deviceWidth = Dimensions.get('window').width;
let deviceHeight = Dimensions.get('window').height;

type Props = {
	navigation: Object,
	children: Object,
	actions?: Object,
	screenProps: Object,
	intl: intlShape.isRequired,
	showModal: boolean,
	validationMessage: any,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	loading: boolean,
};

export interface ScheduleProps {
	navigation: Object,
	actions: Object,
	onDidMount: (h1: string, h2: string, infoButton: ?Object) => void,
}

class AddLocationContainer extends View<null, Props, State> {

	handleBackPress: () => void;

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		children: PropTypes.object.isRequired,
		actions: PropTypes.objectOf(PropTypes.func),
		screenProps: PropTypes.object,
		showModal: PropTypes.bool,
		validationMessage: PropTypes.any,
	};

	state = {
		h1: '',
		h2: '',
	};

	constructor(props: Props) {
		super(props);

		this.backButton = {
			back: true,
			onPress: this.goBack,
		};

		this.closeModal = this.closeModal.bind(this);
		this.handleBackPress = this.handleBackPress.bind(this);
	}

	componentDidMount() {
		BackAndroid.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	componentWillUnmount() {
		BackAndroid.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress(): boolean {
		let {navigation, screenProps} = this.props;
		if (screenProps.currentScreen === 'LocationDetected') {
			screenProps.rootNavigator.goBack();
			return true;
		}
		navigation.dispatch({ type: 'Navigation/BACK'});
		return true;
	}


	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		const isStateEqual = _.isEqual(this.state, nextState);
		const isPropsEqual = _.isEqual(this.props, nextProps);
		return !(isStateEqual && isPropsEqual);
	}

	onChildDidMount = (h1: string, h2: string) => {
		this.setState({
			h1,
			h2,
		});
	};

	closeModal = () => {
		this.props.actions.hideModal();
	};

	getRelativeData = (): Object => {
		let {modalExtras} = this.props;
		return {
			dialgueHeader: modalExtras.dialogueHeader ? modalExtras.dialogueHeader : false,
			showNegative: modalExtras.showNegative ? true : false,
			positiveText: modalExtras.positiveText ? modalExtras.positiveText : false,
			onPressPositive: modalExtras.onPressPositive ? modalExtras.onPressPositive : this.closeModal,
			onPressNegative: modalExtras.onPressNegative ? modalExtras.onPressNegative : this.closeModal,
			dialogueContainerStyle: {backgroundColor: '#00000099'},
		};
	};

	render(): Object {
		const { children, navigation, actions, screenProps, intl,
			showModal, validationMessage } = this.props;
		const { h1, h2 } = this.state;

		let padding = screenProps.currentScreen === 'TimeZoneCity' || screenProps.currentScreen === 'TimeZoneContinent' ? 0 : (deviceWidth * 0.027777);
		// const { dialgueHeader, showNegative, positiveText, onPressPositive, onPressNegative, dialogueContainerStyle} = this.getRelativeData();

		return (
			<View>
				<View style={{
					flex: 1,
					opacity: 1,
					alignItems: 'center',
				}}>
					<AddLocationPoster h1={h1} h2={h2} />
					<View style={[styles.style, {paddingHorizontal: padding}]}>
						{React.cloneElement(
							children,
							{
								onDidMount: this.onChildDidMount,
								navigation,
								actions,
								intl,
								...screenProps,
							},
						)}
					</View>
					<Modal
						modalStyle={[Theme.Styles.notificationModal, {top: deviceHeight * 0.22}]}
						entry= "ZoomIn"
						exit= "ZoomOut"
						entryDuration= {300}
						exitDuration= {100}
						showModal={showModal}>
						<NotificationComponent text={validationMessage} onPress={this.closeModal} />
					</Modal>
				</View>
			</View>
		);
	}

}

const styles = StyleSheet.create({
	style: {
		flex: 1,
	},
});

type mapStateToPropsType = {
	modal: Object,
};

const mapStateToProps = ({ schedule, devices, modal }: mapStateToPropsType): Object => (
	{
		showModal: modal.openModal,
		validationMessage: modal.data,
	}
);

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({...modalActions}, dispatch),
		},
	}
);

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(AddLocationContainer));
