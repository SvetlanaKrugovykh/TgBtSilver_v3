//npm install day-log-savings
logger.write('Input using the default options.');
logger.read();
// Returns a string containing the last 15 lines of todays log file.

logger.read({ path: '2020/11/27', lines: 5 });
// Returns a string containing the last 5 lines of the 27th of November 2020 log file.

logger.read({ array: true, blanks: false });
// Returns an array containing the last 15 lines of todays log file with all the blank lines removed
