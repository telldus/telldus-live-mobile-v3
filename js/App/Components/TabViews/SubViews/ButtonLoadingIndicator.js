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
import { Icon, View } from '../../../../BaseComponents';
import { Animated } from 'react-native';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

type Props = {
};
class ButtonLoadingIndicator extends View {

	blink: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			fadeAnim: new Animated.Value(0),
		};
		this.blink = this.blink.bind(this);
		this.blinking = true;
	}

	componentDidMount() {
		this.blink();
	}

	componentWillUnmount() {
		this.blinking = false;
	}

	render(): Object {
		let { style } = this.props;

		return (
			<AnimatedIcon name="circle" size={10} color="orange" style={[style, { opacity: this.state.fadeAnim }]} />
		);
	}

	blink() {
		Animated.sequence([
			Animated.timing(this.state.fadeAnim, {
				toValue: 1,
				duration: 500,
			}),
			Animated.timing(this.state.fadeAnim, {
				toValue: 0,
				duration: 500,
			}),
		]).start((event: Object) => {
			if (event.finished && this.blinking) {
				this.blink();
			}
		});
	}
}

ButtonLoadingIndicator.propTypes = {
	style: PropTypes.any,
};

module.exports = ButtonLoadingIndicator;
