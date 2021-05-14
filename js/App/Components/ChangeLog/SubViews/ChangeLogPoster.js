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

import { View, PosterWithText } from '../../../../BaseComponents';

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

		return (
			<PosterWithText
				appLayout={appLayout}
				align={'left'}
				h1={h1}
				h2={h2}
				showLeftIcon={false}/>
		);
	}
}

export default (ChangeLogPoster: Object);
