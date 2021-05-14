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

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import {
	View,
	ThemedMaterialIcon,
	LocationDetails,
	IconTelldus,
	EmptyView,
} from '../../../../BaseComponents';

import { hasTokenExpired } from '../../../Lib/LocalControl';
import getLocationImageUrl from '../../../Lib/getLocationImageUrl';
import Status from './Gateway/Status';

import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';
import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = PropsThemedComponent & {
    location: Object,
	appLayout: Object,
	screenReaderEnabled: boolean,
	intl: Object,
	navigation: Object,
	onPress: (Object) => void,
	dispatch: Function,
	disabled?: boolean,
};

type State = {
};

class GatewayRow extends PureComponent<Props, State> {
	props: Props;
	state: State;

	onPressGateway: () => void;

	constructor(props: Props) {
		super(props);

		this.onPressGateway = this.onPressGateway.bind(this);
	}

	onPressGateway() {
		let { location, onPress, disabled = false } = this.props;
		if (disabled) {
			return;
		}
		if (onPress) {
			onPress(location);
		} else {
			this.props.navigation.navigate('LocationDetails', {
				screen: 'Details',
				params: { location },
			});
		}
	}

	getLocationStatus(online: boolean, websocketOnline: boolean, localKey: Object, {
		textStyle,
	}: Object): Object {
		return (
			<Status
				online={online}
				websocketOnline={websocketOnline}
				intl={this.props.intl}
				localKey={localKey}
				textStyle={textStyle} />
		);
	}

	renderCustomComponent = (): Object => {
		let {
			appLayout,
			disabled,
		} = this.props;
		let styles = this.getStyles(appLayout);
		return (
			<View style={styles.arrowCover} pointerEvents={'none'}>
				{
					disabled ?
						<IconTelldus icon={'notavailable'} style={styles.notAvailableIcon}/>
						:
						<ThemedMaterialIcon name={'keyboard-arrow-right'} style={styles.arrow}/>
				}
			</View>
		);
	}

	render(): Object {
		let {
			location,
			appLayout,
			intl,
			screenReaderEnabled,
			disabled,
		} = this.props;

		if (!location) {
			return <EmptyView/>;
		}

		let { name, type, online, websocketOnline, localKey = {} } = location;

		let styles = this.getStyles(appLayout);

		let info = this.getLocationStatus(online, websocketOnline, localKey, {
			textStyle: styles.textStyle,
		});

		let locationImageUrl = getLocationImageUrl(type);
		let locationData = {
			image: locationImageUrl,
			H1: name,
			H2: type,
			info,
		};

		let accessibilityLabel = '';
		if (screenReaderEnabled) {
			const { address, key, ttl, supportLocal } = localKey;
			const tokenExpired = hasTokenExpired(ttl);
			const supportLocalControl = !!(address && key && ttl && !tokenExpired && supportLocal);

			const { formatMessage } = intl;
			const pOne = `${formatMessage(i18n.location)} ${name}`;
			const pTwo = `${formatMessage(i18n.labelType)} ${type}`;

			const labelLocal = formatMessage(i18n.labelLocal);
			const labelCloud = formatMessage(i18n.labelCloud);
			const pThree = `${formatMessage(i18n.labelControl)} ${supportLocalControl ? labelLocal : labelCloud}`;

			const labelOnline = formatMessage(i18n.online);
			const offline = formatMessage(i18n.offline);
			const noLiveUpdates = formatMessage(i18n.noLiveUpdates);

			const pFour = `${formatMessage(i18n.status)} ${!online ? offline :
				!websocketOnline ? noLiveUpdates : labelOnline}`;
			const pFive = `${formatMessage(i18n.labelAddEditDetails)}`;
			accessibilityLabel = `${pOne}, ${pTwo}, ${pThree}, ${pFour}, ${pFive}.`;
		}

		return (
			<View style={styles.rowItemsCover}
				accessible={true}
				accessibilityLabel={accessibilityLabel}>
				<LocationDetails {...locationData}
					style={styles.locationDetails}
					h1Style={styles.h1Style}
					h2Style={styles.h2Style}
					onPress={disabled ? undefined : this.onPressGateway}
					renderCustomComponent={this.renderCustomComponent}/>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const {
			disabled = false,
			colors,
		} = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			paddingFactor,
		} = Theme.Core;

		const {
			card,
			colorBlockDisabled,
			headerOneColorBlockEnabled,
			headerOneColorBlockDisabled,
			iconTwoColorBlock,
			iconTwoColorBlockDisabled,
			infoOneColorBlockDisabled,
			infoOneColorBlockEnabled,
		} = colors;

		const padding = deviceWidth * paddingFactor;
		const rowWidth = width - (padding * 2);
		const rowHeight = deviceWidth * 0.34;

		const colorBackground = disabled ? colorBlockDisabled : card;
		const colorHeaderOneText = disabled ? headerOneColorBlockDisabled : headerOneColorBlockEnabled;
		const colorIconTwo = disabled ? iconTwoColorBlockDisabled : iconTwoColorBlock;

		return {
			rowItemsCover: {
				flexDirection: 'column',
				alignItems: 'center',
			},
			locationDetails: {
				marginVertical: padding / 4,
				backgroundColor: colorBackground,
				width: rowWidth,
				height: rowHeight,
			},
			arrowCover: {
				flex: 0,
				position: 'absolute',
				zIndex: 1,
				right: 0,
				top: '50%',
			},
			arrow: {
				color: colorIconTwo,
				fontSize: rowHeight * 0.5,
			},
			coverStyle: {
				paddingVertical: 5,
			},
			h1Style: {
				color: colorHeaderOneText,
			},
			h2Style: {
				color: colorHeaderOneText,
			},
			notAvailableIcon: {
				fontSize: rowHeight * 0.25,
				color: colorIconTwo,
				right: padding * 2,
			},
			textStyle: {
				color: disabled ? infoOneColorBlockDisabled : infoOneColorBlockEnabled,
			},
		};
	}
}

function mapStateToProps(state: Object, props: Object): Object {
	const { screenReaderEnabled } = state.app;

	return {
		appLayout: state.app.layout,
		screenReaderEnabled,
	};
}

function mapDispatchToProps(dispatch: Object, props: Object): Object {
	return {
		dispatch,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(withTheme(GatewayRow)): Object);
