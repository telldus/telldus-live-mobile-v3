import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from "react-redux";
import { configureStore } from '../../../Store/ConfigureStore';
import { IntlProvider } from 'react-intl';
import { shallow } from 'enzyme';
const store = configureStore();
import WelcomeScreen from "../../../Components/PreLoginScreens/WelcomeScreen";
import { shallowToJson } from 'enzyme-to-json';

describe('<WelcomeScreen />', () => {

    it('should shallow WelcomeScreen', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <IntlProvider>
                    <WelcomeScreen/>
                </IntlProvider>
            </Provider>
        );
        expect(wrapper).toBeTruthy();
        // expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
});