/* eslint-disable no-mixed-spaces-and-tabs */
import React, { Component, Fragment } from 'react';
import { Modal, View, BackHandler, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { ColorWheel } from 'react-native-color-wheel';
import Slider from 'react-native-slider';

// Relative import
import { NavigationHeader, IconTelldus, Poster } from '../../../../../BaseComponents';
import Theme from '../../../../Theme';

class ModalRGB extends Component {

    state = {
    	isModelRGB: false,
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
	// Modal style
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
