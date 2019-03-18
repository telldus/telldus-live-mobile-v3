/* eslint-disable flowtype/require-return-type */
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
/* eslint-disable no-mixed-spaces-and-tabs */
import React, { Fragment } from 'react';
import { Modal, View, BackHandler, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { ColorWheel } from 'react-native-color-wheel';
import Slider from 'react-native-slider';

// Relative import
import { NavigationHeader, IconTelldus, Poster } from '../../../../../BaseComponents';
import Theme from '../../../../Theme';

type Props = {
	isModelRGB?: boolean,
	openModal: () => void,
};

type State = {
    sliderValue: number,
};

class ModalRGB extends View<Props, State> {
    props: Props;
    state: State;

    state = {
    	sliderValue: 10,
    };

    componentWillMount() {
    	BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
    	BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick = () => {
    	const { openModal } = this.props;
    	openModal();
    }

	onColorChanged = (color: any) => {
		console.log(color);
	}

	// eslint-disable-next-line flowtype/require-return-type
	renderBanner = () => {
		const { circle, txtLbl } = styles;
		return (
			<Poster>
				<View style={{ position: 'absolute', alignSelf: 'center', top: 10 }}>
					<View style={circle}>
						<IconTelldus icon="device-alt" size={40} color={Theme.Core.brandSecondary} />
					</View>
					<Text style={txtLbl}>RGB Light Bulb</Text>
				</View>
			</Poster>
		);
	}

	// eslint-disable-next-line flowtype/require-return-type
	renderColorPicker = () => (
		<View style={[ styles.shadowCard, { flex: 1, alignItems: 'center' }]}>
			<ColorWheel
				initialColor="#30A9DE"
				onColorChangeComplete={this.onColorChanged}
				style={{ width: Dimensions.get('window').width - 60 }}
			/>
		</View>
	);

	onSliderValueChange = (value: any) => {
		this.setState({ sliderValue: value });
	}

	// eslint-disable-next-line flowtype/require-return-type
	renderSlider = () => {
		const { sliderValue } = this.state;
		const color = Theme.Core.brandSecondary;
		return (
			<View style={styles.shadowCard}>
				<Text>Dim Value ({Math.floor(sliderValue)}%)</Text>
				<Slider
					maximumValue={100}
					minimumValue={10}
					value={sliderValue}
					onValueChange={this.onSliderValueChange}
					thumbTintColor={color}
					minimumTrackTintColor={color}
				/>
			</View>
		);
	}

	render() {
    	const { isModelRGB } = this.props;
    	return (
    		<Modal
    			animationType="slide"
    			visible={isModelRGB}
    			supportedOrientations={['portrait', 'landscape']}
    			onRequestClose={this.handleBackButtonClick}
    		>
    			<Fragment>
    				<SafeAreaView style={{ flex: 0, backgroundColor: Theme.Core.brandPrimary }} />
    				<SafeAreaView style={{ flex: 1, backgroundColor: '#ECEBEB' }}>
    					<NavigationHeader leftIcon="close" isFromModal={true} onClose={this.handleBackButtonClick} />
    					{this.renderBanner()}
    					<View style={{ height: 300 }}>
    						{this.renderColorPicker()}
    					</View>
    					{this.renderSlider()}
    				</SafeAreaView>
    			</Fragment>
    		</Modal>
    	);
	}
}

const styles = {
	header: {
		height: 80,
		paddingTop: 50,
		paddingHorizontal: 20,
		flexDirection: 'row',
		backgroundColor: '#192F53',
	},
	lbl: {
		textAlign: 'center',
		fontSize: 18,
		fontWeight: '700',
		marginBottom: 5,
		color: '#FFF',
	},
	banner: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 12,
	},
	circle: {
		height: 80,
		width: 80,
		borderRadius: 40,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
	},
	txtLbl: {
		color: 'white',
		fontSize: 14,
		marginTop: 10,
	},
	shadowCard: {
		backgroundColor: '#fff',
		...Theme.Core.shadow,
		borderRadius: 2,
		marginHorizontal: 12,
		marginTop: 8,
		padding: 10,
	},
};

export default ModalRGB;
