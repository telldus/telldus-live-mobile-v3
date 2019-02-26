
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

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import {
	View,
	FormattedMessage,
	TouchableButton,
	Text,
} from '../../../../BaseComponents';
import {
	setKeepHistory,
	showToast,
	getSensorInfo,
} from '../../../Actions';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
    width: number,
    sensorId: number,

    setKeepHistory: (number, number) => Promise<any>,
    showToast: (?string) => void,
    getSensorInfo: (number) => Promise<any>,
};

class HistoryNotStored extends PureComponent<Props, null> {
props: Props;

setKeepHistory: () => void;
constructor(props: Props) {
	super();

	this.setKeepHistory = this.setKeepHistory.bind(this);
}

setKeepHistory() {
	const {
		setKeepHistory: actionKeepHistory,
		sensorId,
		showToast: actionShowToast,
		getSensorInfo: actionGetInfo,
	} = this.props;

	actionKeepHistory(sensorId, 1).then(() => {
		actionGetInfo(sensorId);
	}).catch((err: Object) => {
		const message = err.message ? err.message : null;
		actionShowToast(message);
	});
}

render(): Object {
	const { width } = this.props;
	const {
		container,
		headerStyle,
		contentStyle,
		buttonStyle,
	} = this.getStyles(width);

	return (
		<View style={container}>
			<FormattedMessage
				{...i18n.historyNotStoredHeader}
				style={headerStyle}/>
			<FormattedMessage
				{...i18n.historyNotStoredPOne}
				style={contentStyle}/>
			<Text />
			<FormattedMessage
				{...i18n.historyNotStoredPTwo}
				style={contentStyle}/>
			<TouchableButton
				text={i18n.labelStoreHistory}
				onPress={this.setKeepHistory}
				style={buttonStyle}
				accessible={true}/>
		</View>
	);
}

getStyles(width: number): Object {
	const { eulaContentColor, rowTextColor, fonts } = Theme.Core;
	const fontSizeH = width * 0.07;
	const fontSizeC = width * 0.045;
	return {
		container: {
			flex: 1,
			paddingTop: 30,
			paddingHorizontal: 25,
			alignItems: 'center',
		},
		headerStyle: {
			color: eulaContentColor,
			fontFamily: fonts.robotoRegular,
			fontSize: fontSizeH,
			marginBottom: 10,
			textAlign: 'center',
			paddingHorizontal: 5,
		},
		contentStyle: {
			color: rowTextColor,
			fontFamily: fonts.sfnsDisplay,
			fontSize: fontSizeC,
			textAlign: 'center',
		},
		buttonStyle: {
			marginVertical: 20,
		},
	};
}
}

function mapDispatchToProps(dispatch: Function, ownProps: Object): Object {
	return {
		setKeepHistory: (id: number, keep: number): Promise<any> => {
			return dispatch(setKeepHistory(id, keep));
		},
		showToast: (message?: string) => {
			dispatch(showToast(message));
		},
		getSensorInfo: (id: number): Promise<any> => {
			return dispatch(getSensorInfo(id));
		},
	};
}

export default connect(null, mapDispatchToProps)(HistoryNotStored);
