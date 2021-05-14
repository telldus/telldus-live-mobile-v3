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
	StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';
import Throbber from './Throbber';
import { useSelector } from 'react-redux';

const TransparentFullPageLoadingIndicator = React.memo<Object>((props: Object): Object => {
	const {
		style,
		isVisible,
		animationInTiming,
		animationOutTiming,
		hideModalContentWhileAnimating = true,
		onModalShow,
		customBackdrop,
		throbberContainerStyle,
		throbberStyle,
		backdropOpacity = 0.2,
		backdropColor,
	} = props;

	function _onModalShow() {
		if (onModalShow) {
			onModalShow();
		}
	}

	const { layout } = useSelector((state: Object): Object => state.app);

	const {
		modalStyleDef,
		throbberContainerStyleDef,
		throbberStyleDef,
	} = getStyles(layout);

	return (
		<Modal
			accessible={false}
			style={[modalStyleDef, style]}
			isVisible={isVisible}
			animationInTiming={animationInTiming}
			animationOutTiming={animationOutTiming}
			hideModalContentWhileAnimating={hideModalContentWhileAnimating}
			onModalShow={_onModalShow}
			supportedOrientations={['portrait', 'landscape']}
			customBackdrop={customBackdrop}
			backdropOpacity={backdropOpacity}
			backdropColor={backdropColor}>
			<Throbber
				throbberContainerStyle={[
					throbberContainerStyleDef,
					throbberContainerStyle,
				]}
				throbberStyle={[
					throbberStyleDef,
					throbberStyle,
				]}/>
		</Modal>

	);
});

const getStyles = (layout: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	return {
		modalStyleDef: {
			flex: 1,
			aligItems: 'center',
			justifyContent: 'center',
			...StyleSheet.absoluteFillObject,
		},
		throbberContainerStyleDef: {
			flex: 1,
			aligItems: 'center',
			justifyContent: 'center',
			position: 'relative',
		},
		throbberStyleDef: {
			fontSize: deviceWidth * 0.1,
		},
	};
};

export default (TransparentFullPageLoadingIndicator: Object);
