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

import React, {
	useCallback,
} from 'react';
import {
	Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { SvgXml } from 'react-native-svg';

import {
	View,
	Text,
	SafeAreaView,
} from '../../../BaseComponents';

import Theme from '../../Theme';

const HelpOverlay = (props: Object): Object => {

	const {
		closeHelp,
		isVisible,
		appLayout,
	} = props;

	const {
		infoTextStyle,
		closeIconBoxStyle,
		closePathD,
		closeBoxHeight,
		closeBoxWidth,
		closeModalTextStyle,
		strokeWidth,
	} = getStyles({
		appLayout,
	});

	const closeModal = useCallback(() => {
		closeHelp();
	}, [closeHelp]);

	const Triangle = `
    <marker id="Triangle" viewBox="0 0 10 10" refX="1" refY="5"
            markerUnits="strokeWidth" markerWidth="4" markerHeight="3"
            orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
    </marker>`;

	const closeArrow = `
    <svg xmlns="http://www.w3.org/2000/svg"
    width="${closeBoxWidth}" height="${closeBoxHeight}" viewBox="0 0 ${closeBoxWidth} ${closeBoxHeight}">
    <defs>
        ${Triangle}
    </defs>

        <g fill="none" stroke-width=${strokeWidth} marker-end="url(#Triangle)">
		<path stroke="#fff" d="${closePathD}" marker-end="url(#Triangle)"/>   
     
        </g>
    </svg>`;

	return (
		<Modal
			coverScreen
			style={{
				margin: 0,
			}}
			isVisible={isVisible}>
			<SafeAreaView
				backgroundColor={'transparent'}
				safeAreaBackgroundColor={'transparent'}>
				<View style={{
					flex: 1,
					borderWidth: 1,
					borderColor: 'red',
				}}>
					<View style={closeIconBoxStyle}>
						<SvgXml xml={closeArrow} />
						<Text
							onPress={closeModal}
							style={infoTextStyle}>
                    Close
						</Text>
					</View>
					<Text
						onPress={closeModal}
						style={closeModalTextStyle}>
                    Close Modal
					</Text>
				</View>
			</SafeAreaView>
		</Modal>
	);
};

const getStyles = ({appLayout}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const deviceHeight = isPortrait ? height : width;

	const {
		headerButtonHorizontalPadding,
		headerHeightFactor,
		headerButtonIconSizeFactor,
	} = Theme.Core;

	const { land } = headerHeightFactor;

	const boxHeight = height * 0.2;
	const boxWidth = width * 0.4;
	const navHeaderHeight = Platform.OS === 'android' ?
		deviceHeight * 0.08
		:
		deviceHeight * land;

	const fontSize = deviceWidth * 0.055;
	const iconSize = isPortrait ? width * headerButtonIconSizeFactor : height * headerButtonIconSizeFactor;

	const left = (iconSize / 2) + headerButtonHorizontalPadding;

	const closeBoxHeight = 100 + (deviceWidth * 0.1);
	const closeBoxWidth = 50 + (fontSize * 5);

	let strokeWidth = deviceWidth * 0.015;
	const strokeWidthMax = 10;
	strokeWidth = strokeWidth > strokeWidthMax ? strokeWidthMax : strokeWidth;

	const pathDTop = strokeWidth * 3;
	const closePathD = `M ${left + 42},${pathDTop + 90} C ${left + 40},${pathDTop + 10} ${left},${pathDTop + 30} ${left},${pathDTop}`;

	return {
		closePathD,
		closeBoxHeight,
		closeBoxWidth,
		boxHeight,
		boxWidth,
		strokeWidth,
		closeIconBoxStyle: {
			flex: 0,
			position: 'absolute',
			top: navHeaderHeight - (navHeaderHeight * 0.3),
			borderWidth: 1,
			borderColor: 'red',
		},
		infoTextStyle: {
			position: 'absolute',
			borderWidth: 1,
			borderColor: 'red',
			left: left / (fontSize * 0.03),
			bottom: 0,
			fontSize,
			color: '#fff',
			fontFamily: 'SFNS Display',
		},
		closeModalTextStyle: {
			alignSelf: 'center',
			position: 'absolute',
			bottom: 20,
			fontSize: 40,
			color: '#fff',
			fontFamily: 'SFNS Display',
		},
	};
};

export default HelpOverlay;
