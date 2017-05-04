const repeat = (str, times) => (new Array(times + 1)).join(str);
const pad = (num, maxLength) => repeat('0', maxLength - num.toString().length) + num;
const formatTime = (time) => `${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(time.getSeconds(), 2)}.${pad(time.getMilliseconds(), 3)}`;

export default formatTime;
