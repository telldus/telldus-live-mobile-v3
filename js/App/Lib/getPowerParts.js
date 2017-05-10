/*
 * Returns an array of powers that fit inside a given number
 * 5 => [2, 0] (because: 2^2 + 2^0 = 5)
 * 18 => [4, 1] (because: 2^4 + 2^1 = 16)
 * etc.
 */
function getBiggestPower(num) {
    return Math.floor(Math.log(num) / Math.log(2));
}

export default function getParts(num, memo = []) {
    const biggestPower = getBiggestPower(num);
    const biggestPart = Math.pow(2, biggestPower);
    const remainder = num - biggestPart;
    const newMemo = [...memo, biggestPart];
    if (remainder < 1) {
        return newMemo;
    }
    return getParts(remainder, newMemo);
}
