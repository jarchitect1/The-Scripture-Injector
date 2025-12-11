import { runTests as runParserTests } from './reference-parser.test.js';
import { runTests as runFormatterTests } from './verse-formatter.test.js';


let allTestsPassed = true;

// Run parser tests
const parserTestsPassed = runParserTests();
allTestsPassed = allTestsPassed && parserTestsPassed;


// Run formatter tests
const formatterTestsPassed = runFormatterTests();
allTestsPassed = allTestsPassed && formatterTestsPassed;

if (allTestsPassed) {
} else {
	process.exit(1);
}