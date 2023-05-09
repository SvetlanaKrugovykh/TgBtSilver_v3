function checkValue(value) {

	if (value === undefined || value === null || (typeof value === 'number' && isNaN(value))) return false;

	if (typeof value === 'object' && Object.keys(value).length === 0) return false;

	if (Array.isArray(value) && value.length === 0) return false;

	return !(typeof value === 'string' && value.trim().length === 0);
}


// function checkValue(value: any): boolean {
// 	if (value === undefined || value === null || (typeof value === 'number' && isNaN(value))) {
// 		return false;
// 	}
// 	if (typeof value === 'object' && Object.keys(value).length === 0 && !Array.isArray(value)) {
// 		return false;
// 	}
// 	if (typeof value === 'string' && value.trim().length === 0) {
// 		return false;
// 	}
// 	if (Array.isArray(value) && value.length === 0) {
// 		return false;
// 	}
// 	return true;
// }


module.exports = { checkValue };
