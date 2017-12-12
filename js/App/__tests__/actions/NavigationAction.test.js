import React from 'react';
import * as actions from "../../Actions/Navigation.js";

describe('(Navigation) switchTab ', () => {
  it('should return  SWITCH_TAB', () => {
    const Tab = 'sensorsTab';
      const expectedAction = {
        type: 'SWITCH_TAB',
        tab:Tab,
      };
  expect(actions.switchTab(Tab)).toEqual(expectedAction)
  })
})
