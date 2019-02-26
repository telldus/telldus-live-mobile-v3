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

import { View, Text, Poster } from '../../../../BaseComponents';

import Theme from '../../../Theme';

type Props = {
	h1: string,
	h2: string,
	appLayout: Object,
};

class ChangeLogPoster extends View {
	props: Props;

	static propTypes = {
		h1: PropTypes.string,
		h2: PropTypes.string,
	};

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		const { h1, h2, appLayout } = this.props;
		const styles = this.getStyle(appLayout);

		return (
			<Poster>
				<View style={styles.hContainer}>
					<Text style={[styles.h, styles.h1]}>
						{!!h1 && h1}
					</Text>
					<Text style={[styles.h, styles.h2]}>
						{!!h2 && h2}
					</Text>
				</View>
			</Poster>
		);
	}

	getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;

		return {
			hContainer: {
				position: 'absolute',
				right: isPortrait ? width * 0.1 : height * 0.1,
				top: isPortrait ? width * 0.088 : height * 0.088,
				flex: 1,
				alignItems: 'flex-end',
			},
			h: {
				color: '#fff',
				backgroundColor: 'transparent',
				fontFamily: Theme.Core.fonts.robotoLight,
			},
			h1: {
				fontSize: isPortrait ? width * 0.08 : height * 0.08,
			},
			h2: {
				fontSize: isPortrait ? width * 0.053333333 : height * 0.053333333,
			},
		};
	}
}

export default ChangeLogPoster;
