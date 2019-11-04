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

import React from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import {
	TwoStepFooter,
} from '../../../../BaseComponents';

import {
	toggleVisibilityProExpireHeadsup,
} from '../../../Actions/User';

import i18n from '../../../Translations/common';

const Footer = (props: Object): Object => {
	const {
		navigation,
		onPressPurchase,
	} = props;

	const dispatch = useDispatch();
	function onPressF1() {
		if (onPressPurchase) {
			onPressPurchase();
		}
	}

	function onPressF2() {
		dispatch(toggleVisibilityProExpireHeadsup('hide_perm'));
		navigation.popToTop();
	}

	function onPressF3() {
		dispatch(toggleVisibilityProExpireHeadsup('hide_temp'));
		navigation.popToTop();
	}

	const { formatMessage } = useIntl();

	return (
		<TwoStepFooter
			f1={formatMessage(i18n.renewPremNow).toUpperCase()}
			f2={formatMessage(i18n.labelDontShowAgain).toUpperCase()}
			f3={formatMessage(i18n.labelNotNow).toUpperCase()}
			onPressF1={onPressF1}
			onPressF2={onPressF2}
			onPressF3={onPressF3}
		/>
	);

};

export default Footer;
