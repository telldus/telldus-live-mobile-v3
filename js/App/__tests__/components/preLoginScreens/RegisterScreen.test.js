import React from 'react';
import renderer from 'react-test-renderer';
import { shallow,mount, render } from 'enzyme'
import { Provider } from "react-redux";
import { configureStore } from '../../../Store/ConfigureStore';
import { IntlProvider } from 'react-intl';
const store = configureStore();
import RegisterScreen from "../../../Components/PreLoginScreens/RegisterScreen.js";
import RegisterForm from "../../../Components/PreLoginScreens/subViews/RegisterForm.js";


describe('<RegisterScreen />', () => {

  it('should render RegisterScreen', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <IntlProvider>
          <RegisterScreen>
            <RegisterForm />
          </RegisterScreen>
        </IntlProvider>
      </Provider>
    );

  expect(wrapper.find(RegisterForm).length).toBe(1);
  expect(wrapper.find(RegisterScreen).length).toBe(1);
  });
});

describe('RegisterForm', () => {
    it('check renders of RegisterForm', () => {
        const component = shallow(
          <Provider store={store}>
          <RegisterForm
          email = ''
          firstName = ''
          lastName = ''
          confirmEmail = ''
           />
           </Provider>
         );
         expect(component).toBeTruthy();
    })
  })
