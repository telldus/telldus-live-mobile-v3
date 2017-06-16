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

import React, { PropTypes } from 'react';
import { Text } from 'react-native';
import * as Intl from 'react-intl';

const FormattedNumberComponent = (props : Object) => {
	const style = props.style;

	const formatOptions = {
		localeMatcher: props.localeMatcher,
		style: props.formatStyle,
		currency: props.currency,
		currencyDisplay: props.currencyDisplay,
		useGrouping: props.useGrouping,
		minimumIntegerDigits: props.minimumIntegerDigits,
		minimumFractionDigits: props.minimumFractionDigits,
		maximumFractionDigits: props.maximumFractionDigits,
		minimumSignificantDigits: props.minimumSignificantDigits,
		maximumSignificantDigits: props.maximumSignificantDigits,
		value: props.value,
	};

	return (
		<Intl.FormattedNumber {...formatOptions}>
			{localized => <Text style={style}>{props.prefix}{localized}{props.suffix}</Text>}
		</Intl.FormattedNumber>
	);
};

FormattedNumberComponent.propTypes = {
	style: PropTypes.any,
	localeMatcher: PropTypes.any,
	formatStyle: PropTypes.any,
	currency: PropTypes.any,
	currencyDisplay: PropTypes.any,
	useGrouping: PropTypes.any,
	minimumIntegerDigits: PropTypes.any,
	minimumFractionDigits: PropTypes.any,
	maximumFractionDigits: PropTypes.any,
	minimumSignificantDigits: PropTypes.any,
	maximumSignificantDigits: PropTypes.any,
	value: PropTypes.any,
	prefix: PropTypes.any,
	suffix: PropTypes.any,
};

export default FormattedNumberComponent;
