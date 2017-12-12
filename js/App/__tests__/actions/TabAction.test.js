import React from 'react';
import * as actions from "../../Actions/Tabs.js";

describe('(Tab) toggleEditMode ', () => {
  it('should return  TOGGLE_EDIT_MODE', () => {
    const Tab = 'devicesTab';
      const expectedAction = {
        type: 'TOGGLE_EDIT_MODE',
        tab:Tab,
      };
  expect(actions.toggleEditMode(Tab)).toEqual(expectedAction)
  })
})
