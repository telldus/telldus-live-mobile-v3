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

import {
	Text,
	View,
	TouchableButton,
} from '../../../BaseComponents';
import { PushSettingsRow } from './SubViews';

import { shouldUpdate } from '../../Lib';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	appLayout: Object,
	phonesList: Object,
	isPushSubmitLoading: boolean,
	pushToken: string,

	onDidMount: (string, string, ?string) => void,
	onSubmitDeviceName: (string, string) => Promise<any>,
	intl: Object,
	actions: Object,
	toggleDialogueBox: (Object) => void,
	submitPushToken: (string) => void,
};

class PushSettings extends View<Props, null> {
props: Props;
constructor(props: Props) {
	super(props);

	const { formatMessage } = this.props.intl;
	this.h1 = formatMessage(i18n.labelPushSettings);
	this.h2 = formatMessage(i18n.labelManagePush);
}

componentDidMount() {
	this.props.onDidMount(this.h1, this.h2);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const { appLayout: appLayoutN, currentScreen, ...othersN } = nextProps;
	if (currentScreen === 'PushSettings') {

		const { appLayout, ...others } = this.props;
		if (appLayout.width !== appLayoutN.width) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, ['isPushSubmitLoading', 'pushToken', 'phonesList']);
		if (propsChange) {
			return true;
		}
		return false;
	}
	return false;
}

prepareList(): Object {
	const { pushToken, appLayout, phonesList } = this.props;
	let current, others = [];
	for (let key in phonesList) {
		let { token, name, model } = phonesList[key];
		if (token === pushToken) {
			current = this.renderItem({key, name, model, appLayout, token, editName: true});
		} else {
			others.push(this.renderItem({key, name, model, appLayout, token, editName: false}));
		}
	}

	return {current, others};
}

renderItem(props: Object): Object {
	const { onSubmitDeviceName, actions, toggleDialogueBox, intl } = this.props;

	return (
		<PushSettingsRow
			{...props}
			onSubmitDeviceName={onSubmitDeviceName}
			actions={actions}
			toggleDialogueBox={toggleDialogueBox}
			intl={intl}
		/>
	);
}

render(): Object {
	const {
		appLayout,
		intl,
		isPushSubmitLoading,
	} = this.props;
	const { formatMessage } = intl;

	const {
		container,
		labelStyle,
		labelStyleTwo,
		buttonResubmit,
		pushDisabledContentStyle,
		pushDisabledTextStyle,
		touchableButtonStyle,
	} = this.getStyles(appLayout);

	const { current, others } = this.prepareList();

	const submitButText = isPushSubmitLoading ? `${formatMessage(i18n.pushRegisters)}...` : formatMessage(i18n.pushReRegisterPush);

	return (
		<View style={container}>
			<Text style={labelStyle}>
				{formatMessage(i18n.labelThisDevice)}
			</Text>
			{current ?
				current
				:
				<View style={pushDisabledContentStyle}>
					<Text style={pushDisabledTextStyle}>
						{formatMessage(i18n.labelPushDisabled)}
					</Text>
					<TouchableButton
						text={isPushSubmitLoading ? `${formatMessage(i18n.pushRegisters)}...` : formatMessage(i18n.registerDevicePush)}
						onPress={isPushSubmitLoading ? null : this.props.submitPushToken}
						style={touchableButtonStyle}/>
				</View>
			}
			{!!current && (
				<Text onPress={this.props.submitPushToken} style={buttonResubmit}>
					{submitButText}
				</Text>
			)}
			{(others.length > 0) && (
				[<Text style={[labelStyle, labelStyleTwo]} key={-1}>
					{formatMessage(i18n.labelOtherDevices)}
				</Text>,
			 others]
			)}
		</View>

	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const fontSizeLabel = Math.floor(deviceWidth * 0.045);

	const { paddingFactor, brandSecondary, eulaContentColor } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		container: {
			flex: 1,
		},
		labelStyle: {
			fontSize: fontSizeLabel,
			color: '#b5b5b5',
			marginBottom: 3,
		},
		labelStyleTwo: {
			marginTop: padding * 2,
		},
		buttonResubmit: {
			fontSize: Math.floor(deviceWidth * 0.045),
			color: brandSecondary,
			alignSelf: 'center',
			paddingVertical: 5,
		},
		pushDisabledContentStyle: {
			alignItems: 'center',
			justifyContent: 'center',
			paddingHorizontal: 13,
		},
		pushDisabledTextStyle: {
			fontSize: fontSizeLabel * 0.93,
			color: eulaContentColor,
			textAlign: 'center',
		},
		touchableButtonStyle: {
			marginTop: 10,
		},
	};
}
}

export default PushSettings;
