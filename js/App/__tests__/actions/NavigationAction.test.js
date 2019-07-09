import * as actions from '../../Actions/Navigation.js';

describe('(Navigation) screenChange ', () => {
	it('should return  CHANGE_SCREEN', () => {
		const screen = 'sensorsTab';
		const expectedAction = {
			type: 'CHANGE_SCREEN',
			screen,
		};
		expect(actions.screenChange(screen)).toEqual(expectedAction);
	});
});
