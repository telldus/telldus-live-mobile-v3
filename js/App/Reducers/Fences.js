import Immutable from 'seamless-immutable';
import {createReducer} from 'reduxsauce';
import { REHYDRATE } from 'redux-persist/constants';


export const initialState = Immutable({
    fences: [],
    fence: {},
    editIndex: -1,
    location: {}
});

const setArea = (state, action) => ({
    ...state,
    fence: {
        ...state.fence,
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        radius: action.payload.radius
    }
});
const setArrivingActions = (state, action) => ({
    ...state,
    fence: {
        ...state.fence,
        arriving: action.payload
    }
});
const setLeavingActions = (state, action) => ({
    ...state,
    fence: {
        ...state.fence,
        leaving: action.payload
    }
});

const setActiveTime = (state, action) => ({
    ...state,
    fence: {
        ...state.fence,
        isAlwaysActive: action.payload.isAlwaysActive,
        fromHr: action.payload.fromHr,
        fromMin: action.payload.fromMin,
        toHr: action.payload.toHr,
        toMin: action.payload.toMin
    }
});

const setTitle = (state, action) => ({
    ...state,
    fence: {
        ...state.fence,
        title: action.payload
    }
});

const saveFence = (state, action) => ({
    ...state,
    fences: state.fences.concat(state.fence),
    fence: {}
});

const setCurrentLocation = (state, action) => ({
    ...state,
    location: action.payload
});

const setEditFence = (state, action) => ({
    ...state,
    editIndex: action.payload,
    fence: state.fences[action.payload]
});

const deleteFence = (state, action) => {
    var fences = state.fences.slice();
    fences.splice(state.editIndex, 1);
    return {
        ...state,
        fences: fences
    };
}

const updateFence = (state, action) => {
    var nFences = state.fences.slice();
    nFences.splice(state.editIndex, 1, state.fence);
    return {
        ...state,
        fences: nFences,
        fence: {},
        editIndex: -1
    }
};

const clearFences = (state, action) => ({
    ...state,
    fences: [],
    fence: {},
    editIndex: -1,
});

resetFence = (state, action) => ({
    ...state, 
    fence: {}
});
const actionHandlers = {

    ['SET_FENCE_AREA']: setArea,
    ['SET_FENCE_ARRIVING_ACTIONS']: setArrivingActions,
    ['SET_FENCE_LEAVING_ACTIONS']: setLeavingActions,
    ['SET_FENCE_ACTIVE_TIME']: setActiveTime,
    ['SET_FENCE_TITLE']: setTitle,
    ['SAVE_FENCE']: saveFence,
    ['SET_CURRENT_LOCATION']: setCurrentLocation,
    ['SET_EDIT_FENCE']: setEditFence,
    ['DELETE_FENCE']: deleteFence,
    ['UPDATE_FENCE']: updateFence,
    ['CLEAR_FENCES']: clearFences,
    ['RESET_FENCE']: resetFence

};

export default createReducer(initialState, actionHandlers);