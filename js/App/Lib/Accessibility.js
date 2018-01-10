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
 * @providesModule Accessibility
 */

// @flow

import i18n from '../Translations/common';
import { toSliderValue } from './Dimmer';

module.exports = {
	getLabelDevice: (formatMessage: Function, device: Object): string => {
		const { name, isInState, value } = device;

		const labelDevice = formatMessage(i18n.labelDevice);
		const labelStatus = formatMessage(i18n.status);
		const labelOff = formatMessage(i18n.off);
		const labelOn = formatMessage(i18n.on);
		const labelDim = formatMessage(i18n.dim);
		const labelUp = formatMessage(i18n.up);
		const labelDown = formatMessage(i18n.down);
		const labelStop = formatMessage(i18n.stop);

		const deviceInfo = `${labelDevice} ${name}`;

		switch (isInState) {
			case 'TURNOFF':
				return `${deviceInfo}, ${labelStatus} ${labelOff}`;
			case 'TURNON':
				return `${deviceInfo}, ${labelStatus} ${labelOn}`;
			case 'UP':
				return `${deviceInfo}, ${labelStatus} ${labelUp}`;
			case 'DOWN':
				return `${deviceInfo}, ${labelStatus} ${labelDown}`;
			case 'STOP':
				return `${deviceInfo}, ${labelStatus} ${labelStop}`;
			case 'DIM':
				let dimmerValue = toSliderValue(value);
				return `${deviceInfo}, ${labelStatus} ${dimmerValue}% ${labelDim}`;
			default:
				return `${deviceInfo}`;
		}
	},
};
