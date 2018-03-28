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
import View from './View';
import Base from './Base';
import computeProps from './computeProps';

type Props = {
	contentContainerStyle: Object,
	padder: number,
	children: Object,
};

export default class Content extends Base {
	props: Props;

	prepareRootProps(): Object {

		let type = {
			backgroundColor: 'transparent',
			flex: 1,
		};

		let defaultProps = {
			style: type,
		};

		return computeProps(this.props, defaultProps);
	}

	render(): React$Element<any> {
		const contentContainerStyle = this.props.contentContainerStyle || {};
		contentContainerStyle.padding = (this.props.padder) ? this.getTheme().contentPadding : 0;
		return (
			<View {...this.prepareRootProps()}
			      contentContainerStyle={contentContainerStyle}>{this.props.children}</View>
		);
		//		return(
		//			<KeyboardAwareScrollView resetScrollToCoords={{x:0,y:0}} {...this.prepareRootProps()}
		// contentContainerStyle={contentContainerStyle}>{this.props.children}</KeyboardAwareScrollView> );
	}
}
