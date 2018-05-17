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
import { TouchableOpacity, Modal, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { isIphoneX } from 'react-native-iphone-x-helper';

import { View, Text, StyleSheet, Poster, SafeAreaView } from '../../../BaseComponents';
import { NavigationHeader } from '../DeviceDetails/SubViews';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

type Props = {
	showModal: boolean,
	intl: intlShape,
	onLayout: (Object) => void;
	appLayout: Object,
};

class UserAgreement extends View<Props, null> {
	props: Props;
	onAgree: () => void;

	constructor(props: Props) {
		super(props);
		let { formatMessage } = this.props.intl;
		this.eula = formatMessage(i18n.eula);
		this.header = formatMessage(i18n.userAgreementHeaderPhrase, {eula: this.eula});
		this.footer = formatMessage(i18n.iAgree).toUpperCase();

		this.onAgree = this.onAgree.bind(this);
	}

	onAgree() {
		// TODO once the EULA enpoints are released call 'acceptEULA' with required parameters.
	}

	render(): Object {
		const { showModal, appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;

		return (
			<Modal
				visible={showModal}
				transparent={false}
				animationType={'slide'}
				presentationStyle={'fullScreen'}
				supportedOrientations={['portrait', 'landscape']}>
				<SafeAreaView>
					<View style={styles.modalContainer} onLayout={this.props.onLayout}>
						<NavigationHeader showLeftIcon={false}/>
						<Poster>
							<View style={styles.posterItems}>
								<Text style={styles.headerText}>
									{this.header}
								</Text>
							</View>
						</Poster>
						<ScrollView contentContainerStyle={styles.contentContainerStyle}>
							<Text style={styles.titleText}>
								{this.eula}
							</Text>
							<Text>
							Lorem ipsum
							</Text>
						</ScrollView>
						<View style={[styles.footer, isIphoneX && isPortrait ? { bottom: 30 } : { bottom: 0 }]}>
							<TouchableOpacity style={styles.footerItem} onPress={this.onAgree}>
								<Text style={styles.footerText}>
									{this.footer}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</SafeAreaView>
			</Modal>
		);
	}
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	posterItems: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	contentContainerStyle: {
		paddingHorizontal: 15,
		paddingVertical: 20,
	},
	headerText: {
		fontSize: 18,
		color: '#fff',
		textAlign: 'center',
	},
	titleText: {
		fontSize: 20,
	},
	footer: {
		position: 'absolute',
		alignItems: 'flex-end',
		justifyContent: 'center',
		width: '100%',
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: '#00000040',
	},
	footerItem: {
		padding: 15,
	},
	footerText: {
		fontSize: 14,
		color: Theme.Core.brandSecondary,
		fontWeight: 'bold',
	},
});

function mapDispatchToProps(dispatch: Function, ownProps: Object): Object {
	return {
		dispatch,
	};
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	return {
		appLayout: store.App.layout,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserAgreement));
