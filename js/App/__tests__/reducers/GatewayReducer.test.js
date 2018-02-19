import reducer from '../../Reducers/Gateways.js';

jest.useFakeTimers();

const initialState = {allIds: [], byId: {}, toActivate: {checkIfGatewaysEmpty: false}};

describe('Test Gateways reducers', ()=>{

	it('check Gateways reducers initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	});

	it('check gateway reducers', () => {

		const gateways = {
			allIds: [1, 2, 3, 4, 5],
			byId: {ID: 'tell123'},
			toActivate: {checkIfGatewaysEmpty: false},
		};
		const type = {};
		expect(reducer(gateways, type)).toEqual(gateways);
	});
});
