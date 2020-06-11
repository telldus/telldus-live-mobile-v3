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
import Modal from 'react-native-modal';
import { SvgXml } from 'react-native-svg';

import {
	View,
	Text,
} from '../../../BaseComponents';

const HelpOverlay = (props: Object): Object => {

	const {
		closeHelp,
		isVisible,
		appLayout,
	} = props;

	const {
		boxHeight,
		boxWidth,
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
    width="${boxWidth}" height="${boxHeight}" viewBox="${boxWidth / 2} 0 ${boxWidth} ${boxHeight}">
    <defs>
        ${Triangle}
    </defs>

        <g fill="none" stroke-width="10" marker-end="url(#Triangle)">
        <path stroke="#fff" d="M 175,125 C 150,150 125,150 100,125" marker-end="url(#Triangle)"/>   
     
        </g>
    </svg>`;

	const controlGF = `
    <svg xmlns="http://www.w3.org/2000/svg"
    width="${boxWidth}" height="${boxHeight}" viewBox="${boxWidth / 2} 0 ${boxWidth} ${boxHeight}">
    <defs>
        ${Triangle}
    </defs>

        <g fill="none" stroke-width="10" marker-end="url(#Triangle)">
        <path stroke="#fff" d="M 100,75 C 125,50 150,50 175,20" marker-end="url(#Triangle)"/>
        </g>
    </svg>`;

	return (
		<Modal
			isVisible={isVisible}>
			<View style={{
				flex: 1,
			}}>
				<Text
					onPress={closeModal}
					style={{
						position: 'absolute',
						bottom: 20,
						fontSize: 40,
						color: '#fff',
					}}>
                    Close
				</Text>
				<View style={{
					flex: 0,
					position: 'absolute',
					top: 40,
					backgroundColor: '#00000080',
				}}>
					<SvgXml xml={closeArrow} />
				</View>
				<View style={{
					flex: 0,
					position: 'absolute',
					top: 40,
					right: 10,
					backgroundColor: '#00000080',
				}}>
					<SvgXml xml={controlGF} />
				</View>
			</View>
		</Modal>
	);
};

const getStyles = ({appLayout}: Object): Object => {
	const { height, width } = appLayout;
	// const isPortrait = height > width;
	// const deviceWidth = isPortrait ? width : height;

	const boxHeight = height * 0.2;
	const boxWidth = width * 0.4;

	return {
		boxHeight,
		boxWidth,
	};
};

export default HelpOverlay;
