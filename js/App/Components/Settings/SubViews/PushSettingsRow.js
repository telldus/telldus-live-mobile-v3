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
import { TextInput, LayoutAnimation } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
const isEqual = require('react-fast-compare');

import {
	Text,
	View,
	Row,
	IconTelldus,
	Throbber,
} from '../../../../BaseComponents';
import { LayoutAnimations, shouldUpdate } from '../../../Lib';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
    name: string,
    model: string,
    appLayout: Object,
    editName: boolean,
    token: string,

    deletePushToken: (string) => void,
    actions: Object,
    onSubmitDeviceName: (string, string) => Promise<any>,
    toggleDialogueBox: (Object) => void,
    intl: Object,
};

type State = {
    name: string,
    editNameAcive: boolean,
    isPushSubmitLoading: boolean,
    isDeleteTokenLoading: boolean,
};

class PushSettingsRow extends View<Props, State> {
props: Props;
State: State;

onPressEditName: () => void;
onSubmitEditing: () => void;
onChangeText: (string) => void;
onPressDeleteToken: () => void;
onSubmitDeviceName: (string) => void;
onConfirmDeleteToken: () => void;

static getDerivedStateFromProps(props: Object, state: Object): Object | null {
	const { editNameAcive, isPushSubmitLoading, name } = state;
	if (name !== props.name && !editNameAcive && !isPushSubmitLoading) {
		return {
			name: props.name,
		};
	}
	return null;
}

constructor(props: Props) {
	super(props);

	const { name = ''} = props;
	this.state = {
		name: name.toString(),
		editNameAcive: false,
		isPushSubmitLoading: false,
		isDeleteTokenLoading: false,
	};

	this.onPressEditName = this.onPressEditName.bind(this);
	this.onSubmitEditing = this.onSubmitEditing.bind(this);
	this.onChangeText = this.onChangeText.bind(this);
	this.onPressDeleteToken = this.onPressDeleteToken.bind(this);
	this.onSubmitDeviceName = this.onSubmitDeviceName.bind(this);
	this.onConfirmDeleteToken = this.onConfirmDeleteToken.bind(this);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const { appLayout: appLayoutN, ...othersN } = nextProps;
	const isStateEqual = isEqual(this.state, nextState);
	if (!isStateEqual) {
		return true;
	}

	const { appLayout, ...others } = this.props;
	if (appLayout.width !== appLayoutN.width) {
		return true;
	}

	const propsChange = shouldUpdate(others, othersN, ['name', 'model', 'editName', 'token']);
	if (propsChange) {
		return true;
	}
	return false;
}

onPressEditName() {
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
	this.setState({
		editNameAcive: true,
	});
}

onSubmitEditing() {
	const { onSubmitDeviceName, name: prevName = '' } = this.props;
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
	this.setState({
		editNameAcive: false,
	});
	if (onSubmitDeviceName) {
		const { name } = this.state;
		if (name && (prevName.toString() !== name) && name !== '') {
			this.onSubmitDeviceName(name);
		}
	}
}

onChangeText(name: string) {
	this.setState({
		name,
	});
}

onPressDeleteToken() {
	const { toggleDialogueBox, intl } = this.props;
	const { formatMessage } = intl;
	toggleDialogueBox({
		show: true,
		showHeader: true,
		header: `${formatMessage(i18n.labelRemovePush)}?`,
		imageHeader: true,
		showPositive: true,
		showNegative: true,
		closeOnPressPositive: true,
		positiveText: formatMessage(i18n.delete).toUpperCase(),
		onPressPositive: this.onConfirmDeleteToken,
		text: formatMessage(i18n.labelRemovePushContent),
	});
}

onConfirmDeleteToken() {
	const { token, actions } = this.props;
	this.setState({
		isDeleteTokenLoading: true,
	});
	actions.deletePushToken(token).then(() => {
		this.setState({
			isDeleteTokenLoading: false,
		});
		actions.getPhonesList().then(() => {
			LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
		});
	}).catch(() => {
		this.setState({
			isDeleteTokenLoading: false,
		});
		actions.showToast();
	});
}

onSubmitDeviceName(name: string) {
	const { actions, token, onSubmitDeviceName } = this.props;
	this.setState({
		isPushSubmitLoading: true,
	});
	onSubmitDeviceName(token, name).then((response: Object) => {
		actions.getPhonesList().then(() => {
			this.setState({
				isPushSubmitLoading: false,
			});
			LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
		}).catch(() => {
			this.setState({
				isPushSubmitLoading: false,
			});
		});
	}).catch(() => {
		this.setState({
			isPushSubmitLoading: false,
		});
		actions.showToast();
	});
}

render(): Object {
	const { model, appLayout, editName } = this.props;
	const { name, editNameAcive, isPushSubmitLoading, isDeleteTokenLoading } = this.state;
	const {
		rowStyle,
		rowContainerStyle,
		iconStyle,
		infoContainerStyle,
		h1Style,
		h2Style,
		closeIconSize,
		closeIconStyle,
		editIconColor,
		editIconSize,
		textFieldStyle,
		throbberStyle,
	} = this.getStyles(appLayout);

	return (
		<Row
			style={rowStyle}
			containerStyle={rowContainerStyle}>
			<IconTelldus icon={'phone'} style={iconStyle}/>
			<View style={infoContainerStyle}>
				<View style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'flex-start',
					flex: 1,
				}}>
					{editNameAcive ?
						<TextInput
							value={name}
							style={textFieldStyle}
							onChangeText={this.onChangeText}
							onSubmitEditing={this.onSubmitEditing}
							autoCapitalize="sentences"
							autoCorrect={false}
							autoFocus={true}
							underlineColorAndroid={Theme.Core.brandSecondary}
							returnKeyType={'done'}
						/>
						:
						<Text style={h1Style}>
							{name}
						</Text>
					}
					{isPushSubmitLoading && <Throbber
						style={throbberStyle}
						throbberContainerStyle={{
							position: 'relative',
						}}/>}
					{(!isPushSubmitLoading && editName) &&
							<Icon
								name={editNameAcive ? 'done' : 'edit'}
								size={editIconSize}
								color={editIconColor}
								onPress={editNameAcive ? this.onSubmitEditing : this.onPressEditName}/>
					}
				</View>
				<Text style={h2Style}>
					{model}
				</Text>
			</View>
			{(!isDeleteTokenLoading && !editNameAcive) && (
				<Icon
					name={'close'}
					size={closeIconSize}
					color={'#8e8e93'}
					style={closeIconStyle}
					onPress={this.onPressDeleteToken}/>
			)}
			{isDeleteTokenLoading && <Throbber
				style={throbberStyle}
				throbberContainerStyle={closeIconStyle}/>}
		</Row>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const fontSizeH1 = Math.floor(deviceWidth * 0.058);
	const fontSizeH2 = Math.floor(deviceWidth * 0.035);

	const phoneIconFontSize = fontSizeH1 + fontSizeH2 + 7;
	const closeIconSize = Math.floor(deviceWidth * 0.052);
	const editIconSize = fontSizeH1 * 0.9;

	const { rowTextColor, brandSecondary } = Theme.Core;

	const innerPadding = fontSizeH1 * 0.5;

	return {
		closeIconSize,
		editIconSize,
		editIconColor: brandSecondary,
		rowContainerStyle: {
			height: undefined,
			padding: innerPadding,
			flexDirection: 'row',
			alignItems: 'center',
		},
		rowStyle: {
			flexDirection: 'row',
			justifyContent: 'flex-start',
			alignItems: 'center',
		},
		iconStyle: {
			fontSize: phoneIconFontSize,
		},
		infoContainerStyle: {
			flexDirection: 'column',
			justifyContent: 'center',
			marginHorizontal: innerPadding,
			flex: 1,
		},
		h1Style: {
			fontSize: fontSizeH1,
			color: brandSecondary,
			maxWidth: '90%',
			marginRight: 5,
		},
		h2Style: {
			fontSize: fontSizeH2,
			color: rowTextColor,
			marginTop: 2,
		},
		closeIconStyle: {
			position: 'absolute',
			right: 0,
			top: 0,
		},
		textFieldStyle: {
			flex: 1,
			color: '#A59F9A',
			fontSize: fontSizeH1,
		},
		throbberStyle: {
			color: brandSecondary,
			fontSize: editIconSize,
		},
	};
}
}

export default PushSettingsRow;
