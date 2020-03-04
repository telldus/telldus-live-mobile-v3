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

import { Component } from 'react';
import PropTypes from 'prop-types';
import Theme from '../App/Theme';

export default class Base extends Component<Object, Object> {

	static contextTypes = {
		theme: PropTypes.object,
		foregroundColor: PropTypes.string,
	};

	static propTypes = {
		theme: PropTypes.object,
		foregroundColor: PropTypes.string,
	};

	static childContextTypes = {
		theme: PropTypes.object,
		foregroundColor: PropTypes.string,
	};

	getChildContext(): Object {
		return {
			theme: this.props && this.props.theme ? this.props.theme : this.getTheme(),
			foregroundColor: this.props && this.props.foregroundColor ? this.props.foregroundColor : this.getTheme().textColor,
		};
	}

	getContextForegroundColor(): string {
		return this.context.foregroundColor;
	}

	isValidTheme(theme: any): boolean {
		return theme && typeof theme === 'object';
	}

	getTheme(): Object {
		return this.props && this.isValidTheme(this.props.theme) ? this.props.theme :
			this.context && this.isValidTheme(this.context.theme) ? this.context.theme : Theme.Core;
	}

}
