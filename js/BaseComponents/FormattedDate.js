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
import { injectIntl } from 'react-intl';
import {FormattedDate} from 'react-intl';
import Text from './Text';

const FormattedDateComponent = (props: Object): React$Element<any> => (
	<FormattedDate {...props}>{(formattedDate: string): React$Element<any> => {
		return <Text style={props.style}>{formattedDate}</Text>;
	}}
	</FormattedDate>
);

export default injectIntl(FormattedDateComponent);
