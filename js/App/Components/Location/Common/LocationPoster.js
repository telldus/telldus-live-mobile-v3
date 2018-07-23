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

import { View, NavigationHeaderPoster } from '../../../../BaseComponents';

type InfoButton = {
	onPress?: Function,
	infoButtonContainerStyle?: Array<any> | Object | number,
	infoButtonStyle?: Array<any> | Object | number,
};

type Props = {
	h1: string,
	h2: string,
	infoButton?: InfoButton,
	appLayout: Object,
	screenProps: Object,
	navigation: Object,
	intl: Object,
	icon: string,
	showLeftIcon?: boolean,
	align: 'center' | 'right',
};

type DefaultProps = {
	showLeftIcon: boolean,
};

class LocationPoster extends View<Props, null> {
	props: Props;
	goBack: () => void;

	static defaultProps: DefaultProps = {
		showLeftIcon: true,
	};

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		const { h1, h2, icon, infoButton, appLayout, navigation, intl, align, showLeftIcon } = this.props;

		return (
			<NavigationHeaderPoster
				icon={icon}
				h1={h1}
				h2={h2}
				infoButton={infoButton}
				align={align}
				appLayout={appLayout}
				intl={intl}
				navigation={navigation}
				showLeftIcon={showLeftIcon}/>
		);
	}
}

export default LocationPoster;
