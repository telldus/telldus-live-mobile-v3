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
import { FlatList } from 'react-native';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
	View,
	Header,
	Image,
	Throbber,
	ThemedRefreshControl,
} from '../../../BaseComponents';
import { GatewayRow } from './SubViews';
import {
	NoGateways,
} from './SubViews/EmptyInfo';

import { getGateways } from '../../Actions';

import { parseGatewaysForListView } from '../../Reducers/Gateways';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	rows: Array<Object>,
	screenProps: Object,
	navigation: Object,
	dispatch: Function,
	addNewLocation: () => Promise<any>,
	gatewaysDidFetch: boolean,
	gateways: Array<any>,
	currentScreen: string,
};

type State = {
	isRefreshing: boolean,
};

class GatewaysScreen extends View {

	props: Props;
	state: State;

	renderRow: (renderRowProps: Object) => Object;
	onRefresh: () => void;

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.screenProps.intl;

		this.state = {
			isRefreshing: false,
		};

		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
		this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

		this.renderRow = this.renderRow.bind(this);
		this.onRefresh = this.onRefresh.bind(this);

		this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelLeftIcon = `${formatMessage(i18n.navigationBackButton)} .${this.defaultDescription}`;
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { currentScreen } = nextProps;
		return currentScreen === 'Gateways';
	}

	onRefresh() {
		this.setState({
			isRefreshing: true,
		});
		this.props.dispatch(getGateways()).then(() => {
			this.setState({
				isRefreshing: false,
			});
		}).catch(() => {
			this.setState({
				isRefreshing: false,
			});
		});
	}

	renderRow(item: Object): Object {
		const { navigation, screenProps } = this.props;
		const { intl } = screenProps;
		return (
			<GatewayRow location={item.item} navigation={navigation} intl={intl}/>
		);
	}

	keyExtractor(item: Object): string {
		return item.id.toString();
	}

	getPadding(): number {
		const { appLayout } = this.props.screenProps;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		return deviceWidth * Theme.Core.paddingFactor;
	}

	getRightButton = (styles: Object): Object => {
		const {
			addNewLocation,
			intl,
			addingNewLocation,
		} = this.props.screenProps;
		const {
			addIconStyle,
			fontSizeIcon,
		} = styles;

		const {
			formatMessage,
		} = intl;

		const throbber = {
			component: <Throbber
				throbberStyle={{
					fontSize: fontSizeIcon,
					color: '#fff',
				}}
				throbberContainerStyle={{
					position: 'relative',
				}}/>,
			onPress: () => {},
		};

		if (addingNewLocation) {
			return {
				...throbber,
			};
		}

		const AddButton = {
			component: <Image source={{uri: 'icon_plus'}} style={addIconStyle}/>,
			onPress: () => {},
		};

		return {
			...AddButton,
			onPress: addNewLocation,
			accessibilityLabel: `${formatMessage(i18n.addNewLocation)}, ${formatMessage(i18n.defaultDescriptionButton)}`,
		};
	}

	goBack = () => {
		this.props.navigation.pop();
	}

	getLeftButton = (styles: Object): Object => {
		const {
			iconLeftStyle,
			leftIconSize,
		} = styles;

		return {
			component: <MaterialIcons
				name={'close'}
				size={leftIconSize}
				color="#fff"
				style={iconLeftStyle}/>,
			onPress: this.goBack,
			accessibilityLabel: this.labelLeftIcon,
		};
	}


	render(): Object {
		const padding = this.getPadding();
		const {
			rows,
			gateways,
			gatewaysDidFetch,
			navigation,
			screenProps,
		} = this.props;
		const {
			appLayout,
			addingNewLocation,
			addNewLocation,
		} = screenProps;

		const styles = this.getStyles(appLayout);

		const rightButton = this.getRightButton(styles);
		const leftButton = this.getLeftButton(styles);

		return (
			<View
				level={3}
				style={{
					flex: 1,
				}}>
				<Header
					leftButton={leftButton}
					navigation={navigation}
					rightButton={rightButton}/>
				{gateways.length === 0 && gatewaysDidFetch ?
					<NoGateways
						disabled={addingNewLocation}
						onPress={addNewLocation}/>
					:
					<FlatList
						data={rows}
						renderItem={this.renderRow}
						keyExtractor={this.keyExtractor}
						contentContainerStyle={{
							paddingTop: padding - (padding / 4),
							paddingBottom: padding,
						}}
						refreshControl={
							<ThemedRefreshControl
								refreshing={this.state.isRefreshing}
								onRefresh={this.onRefresh}
							/>}
					/>
				}
			</View>
		);
	}

	getStyles = (appLayout: Object): Object => {

		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;

		const {
			fontSizeFactorSix,
		} = Theme.Core;

		const size = Math.floor(deviceHeight * fontSizeFactorSix);
		const fontSizeIcon = size < 20 ? 20 : size;

		let leftIconSize = isPortrait ? width * 0.06 : height * 0.06;

		return {
			fontSizeIcon,
			addIconStyle: {
				height: fontSizeIcon,
				width: fontSizeIcon,
			},
			iconLeftStyle: {
				paddingVertical: 10,
			},
			leftIconSize,
		};
	}
}

const getRows = createSelector(
	[
		({ gateways }: Object): Object => gateways,
	],
	(gateways: Object): Array<any> => parseGatewaysForListView(gateways)
);

function mapStateToProps(state: Object, props: Object): Object {

	const { screen: currentScreen } = state.navigation;

	return {
		rows: getRows(state),
		gateways: state.gateways.allIds,
		gatewaysDidFetch: state.gateways.didFetch,
		currentScreen,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

module.exports = (connect(mapStateToProps, mapDispatchToProps)(GatewaysScreen): Object);
