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
	SafeAreaView,
} from 'react-native';
import Modal from 'react-native-modal';
import { SvgXml } from 'react-native-svg';

import {
	View,
	Text,
} from '../../../BaseComponents';

import Theme from '../../Theme';

const HelpOverlay = (props: Object): Object => {

	const {
		closeHelp,
		isVisible,
		appLayout,
		pointCurrentLocation,
	} = props;

	const {
		infoTextStyle,
		closeIconBoxStyle,
		closeModalTextStyle,
		controlGFIconBoxStyle,
		closeTextStyle,
		controlGFTextStyle,
		closeArrow,
		controlGFArrow,
		AddNewArrow,
		currentPosArrow,
		currentPosIconBoxStyle,
		currentPosTextStyle,
		addNewIconBoxStyle,
		addNewTextStyle,
		currentLocationBoxStyle,
		currentLocationArrow,
		currentLocationTextStyle,
	} = getStyles({
		appLayout,
		pointCurrentLocation,
	});

	const {
		x,
		y,
	} = pointCurrentLocation;

	const closeModal = useCallback(() => {
		closeHelp();
	}, [closeHelp]);

	return (
		<Modal
			coverScreen
			style={{
				margin: 0,
			}}
			isVisible={isVisible}
			swipeDirection={['left', 'right']}
			onSwipeComplete={closeModal}>
			<SafeAreaView
				style={{
					flex: 1,
				}}>
				<View style={{
					flex: 1,
				}}>
					<View style={closeIconBoxStyle}>
						<SvgXml xml={closeArrow} />
						<Text
							style={[infoTextStyle, closeTextStyle]}>
                    CLOSE
						</Text>
					</View>
					<View style={controlGFIconBoxStyle}>
						<Text
							style={[infoTextStyle, controlGFTextStyle]}>
                    TAP TO TURN ON/OFF GEOFENCE
						</Text>
						<SvgXml xml={controlGFArrow} />
					</View>
					{(x || y) && (<View style={currentLocationBoxStyle}>
						<SvgXml xml={currentLocationArrow} />
						<Text
							style={[infoTextStyle, currentLocationTextStyle]}>
                    CURRENT POSITION
						</Text>
					</View>
					)}
					<View style={currentPosIconBoxStyle}>
						<SvgXml xml={currentPosArrow} />
						<Text
							style={[infoTextStyle, currentPosTextStyle]}>
                    CENTER TO CURRENT POSITION
						</Text>
					</View>
					<View style={addNewIconBoxStyle}>
						<SvgXml xml={AddNewArrow} />
						<Text
							style={[infoTextStyle, addNewTextStyle]}>
                    ADD NEW GEOFENCE
						</Text>
					</View>
					<Text
						style={closeModalTextStyle}>
                    Swipe to close
					</Text>
				</View>
			</SafeAreaView>
		</Modal>
	);
};

const getStyles = ({
	appLayout,
	pointCurrentLocation,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const deviceHeight = isPortrait ? height : width;

	const {
		x,
		y,
	} = pointCurrentLocation;

	const {
		headerButtonHorizontalPadding,
		headerHeightFactor,
		headerButtonIconSizeFactor,
		maxSizeFloatingButton,
		floatingButtonSizefactor,
		floatingButtonOffsetfactor,
	} = Theme.Core;

	const { land } = headerHeightFactor;

	const navHeaderHeight = Platform.OS === 'android' ?
		deviceHeight * 0.08
		:
		deviceHeight * land;

	const fontSize = deviceWidth * 0.045;
	const iconSize = isPortrait ? width * headerButtonIconSizeFactor : height * headerButtonIconSizeFactor;

	const left = (iconSize / 2) + headerButtonHorizontalPadding;
	const rightGF = (deviceWidth * 0.055) + headerButtonHorizontalPadding;

	const closeBoxHeight = 100 + (deviceWidth * 0.1);
	const closeBoxWidth = 50 + (fontSize * 5);

	const controlGFBoxHeight = 100 + (deviceWidth * 0.3);
	const controlGFBoxWidth = 50 + (fontSize * 6);

	let strokeWidth = deviceWidth * 0.015;
	const strokeWidthMax = 10;
	strokeWidth = strokeWidth > strokeWidthMax ? strokeWidthMax : strokeWidth;

	const pathDTop = strokeWidth * 3;
	const closePathD = `M ${left + 42},${pathDTop + 90} C ${left + 40},${pathDTop + 10} ${left},${pathDTop + 30} ${left},${pathDTop}`;

	const controlGFRight = controlGFBoxWidth - rightGF;
	const sizeFactorTop = deviceWidth * 0.02;
	const controlGFPathD = `M ${controlGFRight - 42},${pathDTop + sizeFactorTop + 110} C ${controlGFRight - 40},${pathDTop + sizeFactorTop + 10} ${controlGFRight},${pathDTop + sizeFactorTop + 25} ${controlGFRight},${pathDTop + sizeFactorTop}`;

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

	const controlGFArrow = `
    <svg xmlns="http://www.w3.org/2000/svg"
    width="${controlGFBoxWidth}" height="${controlGFBoxHeight}" viewBox="0 0 ${controlGFBoxWidth} ${controlGFBoxHeight}">
    <defs>
        ${Triangle}
    </defs>

        <g fill="none" stroke-width=${strokeWidth} marker-end="url(#Triangle)">
		<path stroke="#fff" d="${controlGFPathD}" marker-end="url(#Triangle)"/>   
     
        </g>
	</svg>`;

	const {
		right,
		bottom,
	} = floatingButtonOffsetfactor;
	const offsetBottom = deviceWidth * bottom;
	const offsetRight = deviceWidth * right;
	let buttonSize = deviceWidth * floatingButtonSizefactor;
	buttonSize = buttonSize > maxSizeFloatingButton ? maxSizeFloatingButton : buttonSize;

	const bottomBoxCurrPos = offsetBottom + (buttonSize * 1.2) + 10;

	const currentPosBoxHeight = 30 + (buttonSize / 2) + (fontSize * 1.2);
	const currentPosBoxWidth = width;

	const currentPosX = currentPosBoxWidth - (offsetRight + (strokeWidth * 3) + buttonSize);
	const currentPosY = currentPosBoxHeight - (buttonSize / 2);
	const currentPosPathD = `M ${currentPosX - 95},${currentPosY - 30} C ${currentPosX - 40},${currentPosY - 5} ${currentPosX - 20},${currentPosY} ${currentPosX},${currentPosY}`;

	const currentPosArrow = `
	<svg xmlns="http://www.w3.org/2000/svg"
    width="${currentPosBoxWidth}" height="${currentPosBoxHeight}" viewBox="0 0 ${currentPosBoxWidth} ${currentPosBoxHeight}">
    <defs>
        ${Triangle}
    </defs>
        <g fill="none" stroke-width=${strokeWidth} marker-end="url(#Triangle)">
			<path stroke="#fff" d="${currentPosPathD}" marker-end="url(#Triangle)"/>
        </g>
	</svg>`;

	const addNewBoxHeight = 30 + offsetBottom + (buttonSize / 2) + (fontSize * 1.2);
	const addNewBoxWidth = width;

	const addNewX = addNewBoxWidth - (offsetRight + (strokeWidth * 3) + buttonSize);
	const addNewY = addNewBoxHeight - (offsetBottom + (buttonSize / 2));
	const addNewPathD = `M ${addNewX - 95},${addNewY - 30} C ${addNewX - 40},${addNewY - 5} ${addNewX - 20},${addNewY} ${addNewX},${addNewY}`;

	const AddNewArrow = `
    <svg xmlns="http://www.w3.org/2000/svg"
    width="${addNewBoxWidth}" height="${addNewBoxHeight}" viewBox="0 0 ${addNewBoxWidth} ${addNewBoxHeight}">
    <defs>
        ${Triangle}
    </defs>
        <g fill="none" stroke-width=${strokeWidth} marker-end="url(#Triangle)">
			<path stroke="#fff" d="${addNewPathD}" marker-end="url(#Triangle)"/>
        </g>
	</svg>`;

	const currentLocationBoxHeight = 30 + offsetBottom + (buttonSize / 2) + (fontSize * 1.2);
	const currentLocationBoxWidth = width / 2;
	const currentLocationX = currentLocationBoxWidth - (strokeWidth * 3);
	const currentLocationY = (currentLocationBoxHeight * 0.5);
	const currentLocationPathD = `M ${currentLocationX - 95},${currentLocationY - 30} C ${currentLocationX - 40},${currentLocationY - 5} ${currentLocationX - 20},${currentLocationY} ${currentLocationX},${currentLocationY}`;

	const currentLocationArrow = `
    <svg xmlns="http://www.w3.org/2000/svg"
    width="${currentLocationBoxWidth}" height="${currentLocationBoxHeight}" viewBox="0 0 ${currentLocationBoxWidth} ${currentLocationBoxHeight}">
    <defs>
        ${Triangle}
    </defs>
        <g fill="none" stroke-width=${strokeWidth} marker-end="url(#Triangle)">
			<path stroke="#fff" d="${currentLocationPathD}" marker-end="url(#Triangle)"/>
        </g>
	</svg>`;

	return {
		closeArrow,
		controlGFArrow,
		currentPosArrow,
		AddNewArrow,
		currentLocationArrow,
		closeIconBoxStyle: {
			flex: 0,
			position: 'absolute',
			top: navHeaderHeight - (navHeaderHeight * 0.3),
		},
		infoTextStyle: {
			width: '100%',
			position: 'absolute',
			textAlign: 'center',
			fontSize,
			color: '#fff',
			fontFamily: 'SFNS Display',
		},
		closeTextStyle: {
			top: pathDTop + 90,
		},
		closeModalTextStyle: {
			alignSelf: 'center',
			position: 'absolute',
			fontSize: 40,
			color: '#fff',
			fontFamily: 'SFNS Display',
		},
		controlGFIconBoxStyle: {
			alignItems: 'stretch',
			flex: 0,
			position: 'absolute',
			top: navHeaderHeight - (navHeaderHeight * 0.3),
			right: 0,
		},
		controlGFTextStyle: {
			top: pathDTop + sizeFactorTop + 115,
		},
		currentPosIconBoxStyle: {
			width: '100%',
			position: 'absolute',
			right: 0,
			bottom: bottomBoxCurrPos,
		},
		currentPosTextStyle: {
			bottom: currentPosBoxHeight - fontSize,
		},
		addNewIconBoxStyle: {
			width: '100%',
			position: 'absolute',
			right: 0,
			bottom: 0,
		},
		addNewTextStyle: {
			bottom: addNewBoxHeight - fontSize,
		},
		currentLocationBoxStyle: {
			alignItems: 'stretch',
			flex: 0,
			position: 'absolute',
			top: (y + navHeaderHeight) - (currentLocationBoxHeight / 2),
			right: x,
		},
		currentLocationTextStyle: {
			bottom: currentLocationBoxHeight - fontSize,
		},
	};
};

export default HelpOverlay;
