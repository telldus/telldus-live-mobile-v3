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
import { defineMessages } from 'react-intl';

import { Row, View } from '../../../../BaseComponents';
import Day from './Day';
import { getTranslatableDays } from '../../../Lib';

const messages = defineMessages({
	phraseOne: {
		id: 'accessibilityLabel.schedule.daysRow.phraseOne',
		defaultMessage: 'Active on {value}',
	},
	messageNoDays: {
		id: 'accessibilityLabel.schedule.daysRow.messageNoDays',
		defaultMessage: 'No days chosen. Please choose a day',
	},
});

type Props = {
	selectedDays: string[],
	onDayPress?: Function,
	containerStyle?: Object,
	editMode?: boolean,
	onPress?: Function,
	appLayout: Object,
	intl: Object,
};

type DefaultProps = {
	editMode: boolean,
};

export default class DaysRow extends View<DefaultProps, Props, null> {

	static propTypes = {
		selectedDays: PropTypes.arrayOf(PropTypes.string).isRequired,
		onDayPress: PropTypes.func,
		containerStyle: PropTypes.object,
		editMode: PropTypes.bool,
		onPress: PropTypes.func,
	};

	static defaultProps = {
		editMode: false,
	};

	constructor(props: Props) {
		super(props);

		let { formatDate } = this.props.intl;
		this.days = getTranslatableDays(formatDate);
	}

	render(): React$Element<any> {
		const { containerStyle, onPress, appLayout } = this.props;
		const { container, row } = this._getStyle(appLayout);

		const { days, daysToRender } = this._getWeekdays();
		const accessibilityLabel = this._getAccessibilityLabel(days);

		return (
			<Row
				layout="row"
				containerStyle={[container, containerStyle]}
				style={row}
				onPress={onPress}
				importantForAccessibility={'yes'}
				accessibilityLabel={accessibilityLabel}
			>
				{daysToRender}
			</Row>
		);
	}

	_getAccessibilityLabel(label: string): string {
		const { labelPostScript = '', intl } = this.props;
		const { formatMessage } = intl;
		if (label && label.length !== 0) {
			const phraseTwo = `${label}, ${labelPostScript}`;
			return formatMessage(messages.phraseOne, {value: phraseTwo});
		}
		return formatMessage(messages.messageNoDays);
	}

	_getWeekdays = (): Object => {
		const { appLayout, intl } = this.props, days = [], daysToRender = [];
		this.days.map((day: string) => {
			const isDaySelected = this._isDaySelected(day);
			if (isDaySelected) {
				days.push(day);
			}
			daysToRender.push(<Day
				day={day}
				isSelected={isDaySelected}
				onPress={this.props.onDayPress}
				key={day}
				appLayout={appLayout}
				intl={intl}
			/>);
		});
		return { days, daysToRender };
	};

	_isDaySelected = (day: string): boolean => {
		return this.props.selectedDays.includes(day);
	};

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		return {
			container: {
				height: null,
			},
			row: {
				alignItems: 'center',
				justifyContent: 'space-between',
				paddingVertical: this.props.editMode ? deviceWidth * 0.102666667 : deviceWidth * 0.076,
				paddingHorizontal: deviceWidth * 0.056,
			},
		};
	};

}
