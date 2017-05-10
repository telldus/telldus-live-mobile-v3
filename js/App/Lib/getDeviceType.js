export default function getDeviceType(supportedMethods) {
    const {
		TURNON,
		TURNOFF,
		BELL,
		DIM,
		UP,
		DOWN,
		STOP,
	} = supportedMethods;

	if (BELL) {
        return 'BELL';
	} else if (UP || DOWN || STOP) {
        return 'NAVIGATIONAL';
	} else if (DIM) {
        return 'DIMMER';
	} else if (TURNON || TURNOFF) {
        return 'TOGGLE';
	} else {
		return 'UNSUPPORTED';
	}
}
