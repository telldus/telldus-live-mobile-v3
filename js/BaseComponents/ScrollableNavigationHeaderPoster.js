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
import { StyleSheet, BackHandler, Platform } from 'react-native';

import View from './View';
import ThemedScrollView from './ThemedScrollView';
import NavigationHeader from './NavigationHeader';
import PosterWithText from './PosterWithText';

type InfoButton = {
	onPress?: Function,
	infoButtonContainerStyle?: Array<any> | Object,
	infoButtonStyle?: Array<any> | Object,
};

type Props = {
    h1: string,
    h2: string,
	icon: string,
    appLayout: Object,
    showBackButton?: boolean,
    align?: 'right' | 'center' | 'left',
	infoButton?: InfoButton,
	showLeftIcon?: boolean,
	leftIcon: string,

	navigation: Object,
    handleBackPress: () => boolean,
    intl: Object,
	posterCoverStyle?: Array<any> | Object,
	goBack: () => void,
	children: Object | Array<Object>,
};

type DefaultProps = {
    showBackButton: boolean,
	align: 'right' | 'center' | 'left',
	showLeftIcon: boolean,
	leftIcon: string,
};

class ScrollableNavigationHeaderPoster extends React.Component<Props, null> {
props: Props;

static defaultProps: DefaultProps = {
	showBackButton: true,
	align: 'center',
	showLeftIcon: true,
	leftIcon: Platform.OS === 'ios' ? 'angle-left' : 'arrow-back',
};

goBack: () => void;
handleBackPress: () => boolean;

constructor(props: Props) {
	super(props);
}

goBack = () => {
	this.props.navigation.pop();
}

componentDidMount() {
	BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
}

componentWillUnmount() {
	BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
}

handleBackPress = (): boolean => {
	let { handleBackPress } = this.props;
	if (handleBackPress) {
		return handleBackPress();
	}
	return false;
}

render(): Object {
	const {
		navigation,
		h1, h2,
		icon,
		appLayout,
		showBackButton,
		posterCoverStyle,
		infoButton,
		showLeftIcon,
		leftIcon,
		goBack,
		children,
		align,
	} = this.props;

	return (
		<View style={styles.container}>
			<NavigationHeader
				navigation={navigation}
				showLeftIcon={showLeftIcon}
				leftIcon={leftIcon}
				goBack={goBack}/>
			<ThemedScrollView
				level={3}
				style={{flex: 1}}
				contentContainerStyle={{flexGrow: 1}}>
				<PosterWithText
					appLayout={appLayout}
					align={align}
					icon={icon}
					h1={h1}
					h2={h2}
					showBackButton={showBackButton}
					showLeftIcon={showLeftIcon}
					navigation={navigation}
					infoButton={infoButton}
					leftIcon={leftIcon}
					posterCoverStyle={posterCoverStyle}/>
				{
					React.Children.map(children, (child: Object): Object | null => {
						if (React.isValidElement(child)) {
							return React.cloneElement(child);
						}
						return null;
					})
				}
			</ThemedScrollView>
		</View>
	);
}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default (ScrollableNavigationHeaderPoster: Object);
