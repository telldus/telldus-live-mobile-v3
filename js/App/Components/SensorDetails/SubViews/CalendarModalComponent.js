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
import { TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
import DeviceInfo from 'react-native-device-info';

import {
	View,
	Poster,
	Text,
	FormattedDate,
} from '../../../../BaseComponents';
import CalendarDay from './CalendarDay';

import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

type Props = {
	isVisible: boolean,
	current: any,
	onPressPositive: (any) => void,
	onPressNegative: () => void,
	appLayout: Object,
	intl: Object,
	maxDate: string,
};

type DefaultProps = {
	isVisible: boolean,
};

export default class CalendarModalComponent extends View<Props, null> {
props: Props;
static defaultProps: DefaultProps = {
	isVisible: false,
};

isTablet: boolean;

static getDerivedStateFromProps(props: Object, state: Object): null | Object {
	const { isVisible, current } = props;
	if (isVisible !== state.isVisible) {
		return {
			isVisible,
			current,
		};
	}
	if ((current !== state.current) && !state.isVisible) {
		return {
			current,
			isVisible,
		};
	}
	return null;
}

onPressPositive: () => void;
onPressNegative: () => void;
onDayPress: (Object) => void;

renderDay: (Object) => void;

constructor(props: Props) {
	super(props);

	this.state = {
		current: props.current,
		isVisible: props.isVisible,
	};
	this.isTablet = DeviceInfo.isTablet();

	this.onPressPositive = this.onPressPositive.bind(this);
	this.onPressNegative = this.onPressNegative.bind(this);
	this.onDayPress = this.onDayPress.bind(this);

	this.renderDay = this.renderDay.bind(this);

	const { formatMessage } = props.intl;
	this.ok = formatMessage(i18n.defaultPositiveText);
	this.cancel = formatMessage(i18n.defaultNegativeText);
}

onPressPositive() {
	const { onPressPositive } = this.props;
	const { current } = this.state;
	if (onPressPositive) {
		onPressPositive(current);
	}
}

onPressNegative() {
	const { onPressNegative } = this.props;
	if (onPressNegative) {
		onPressNegative();
	}
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	const isStateEqual = isEqual(this.state, nextState);
	const isLayoutEqual = isEqual(this.props.appLayout, nextProps.appLayout);
	const isMaxDateEqual = nextProps.maxDate === this.props.maxDate;
	return (nextState.isVisible || this.state.isVisible) && (!isStateEqual || !isLayoutEqual || isMaxDateEqual);
}

onDayPress(day: Object) {
	this.setState({
		current: day.timestamp / 1000,
	});
}

renderDay({date, state, marking}: Object): Object {
	const props = {
		date,
		state,
		marking,
		onDayPress: this.onDayPress,
		appLayout: this.props.appLayout,
	};
	return (
		<CalendarDay {...props} />
	);
}

render(): Object {
	const { current, isVisible } = this.state;
	const {
		appLayout,
		maxDate,
	} = this.props;

	const {
		containerStyle,
		posterWidth,
		posterHeight,
		posterItemsStyle,
		posterTextOneStyle,
		posterTextTwoStyle,
		calendarTheme,
		footerStyle,
		positiveLabelStyle,
		negativeLabelStyle,
	} = this.getStyle(appLayout);
	const date = moment.unix(current).format('YYYY-MM-DD');

	return (
		<Modal
			isVisible={isVisible}
			hideModalContentWhileAnimating={true}
			supportedOrientations={['portrait', 'landscape']}
			onRequestClose={this.onPressNegative}>
			<ScrollView style={{flex: 1}} contentContainerStyle={containerStyle}>
				<Poster posterWidth={posterWidth} posterHeight={posterHeight}>
					<View style={posterItemsStyle}>
						<FormattedDate
							value={moment.unix(current)}
							year="numeric"
							style={posterTextOneStyle}/>
						<FormattedDate
							value={moment.unix(current)}
							day="numeric"
							month="short"
							weekday="short"
							style={posterTextTwoStyle}/>
					</View>
				</Poster>
				<Calendar
					markedDates={{
						[date]: {selected: true, marked: false},
					}}
					maxDate={maxDate}
					dayComponent={this.renderDay}
					theme={calendarTheme}
					firstDay={1}/>
				<View style={footerStyle}>
					<TouchableOpacity onPress={this.onPressNegative}>
						<Text style={negativeLabelStyle}>
							{this.cancel}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={this.onPressPositive}>
						<Text style={positiveLabelStyle}>
							{this.ok}
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</Modal>
	);
}

getStyle(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { brandSecondary, eulaContentColor, offlineColor } = Theme.Core;

	const adjustCelendar = !this.isTablet && !isPortrait;

	const posterHeight = adjustCelendar ? deviceWidth * 0.12 : deviceWidth * 0.333;

	const fontSizePosterTextOne = posterHeight * 0.2;
	const fontSizePosterTextTwo = posterHeight * 0.3;
	const fontSizeFooterText = adjustCelendar ? deviceWidth * 0.03 : deviceWidth * 0.05;
	const footerPadding = adjustCelendar ? fontSizeFooterText * 0.5 : fontSizeFooterText;

	return {
		containerStyle: {
			flexGrow: 1,
			justifyContent: 'center',
		},
		posterWidth: '100%',
		posterHeight,
		posterItemsStyle: {
			flex: 1,
			position: 'absolute',
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			paddingLeft: 15,
			justifyContent: 'center',
			alignItems: 'flex-start',
		},
		posterTextOneStyle: {
			fontSize: fontSizePosterTextOne,
			color: '#fff',
		},
		posterTextTwoStyle: {
			fontSize: fontSizePosterTextTwo,
			color: '#fff',
			fontWeight: 'bold',
		},
		calendarTheme: {
			textSectionTitleColor: offlineColor,
			selectedDayBackgroundColor: brandSecondary,
			todayTextColor: '#00adf5',
			arrowColor: '#000',
			monthTextColor: '#000',
			'stylesheet.calendar.main': {
				week: {
				  marginTop: 0,
				  marginBottom: 0,
				  flexDirection: 'row',
				  justifyContent: 'space-around',
				},
			},
		},
		footerStyle: {
			flexDirection: 'row',
			backgroundColor: '#fff',
			justifyContent: 'flex-end',
			paddingVertical: footerPadding,
			paddingRight: adjustCelendar ? 10 : 0,
		},
		positiveLabelStyle: {
			color: brandSecondary,
			fontSize: fontSizeFooterText,
			marginLeft: 20,
			marginRight: 15,
		},
		negativeLabelStyle: {
			color: eulaContentColor,
			fontSize: fontSizeFooterText,
		},
	};
}
}
