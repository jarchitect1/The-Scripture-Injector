import { BibleReferenceParser } from '../parser/reference-parser';

// Simple test runner for the reference parser
function runTests() {
	const parser = new BibleReferenceParser();
	let passedTests = 0;
	let totalTests = 0;

	function test(description: string, testFn: () => void) {
		totalTests++;
		try {
			testFn();
			passedTests++;
		} catch (error) {
		}
	}

	function assertEqual(actual: any, expected: any, message?: string) {
		if (JSON.stringify(actual) !== JSON.stringify(expected)) {
			throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
		}
	}

	// Test single verse
	test('Parse single verse (John 3:16)', () => {
		const result = parser.parse('John 3:16');
		assertEqual(result.book, 'John');
		assertEqual(result.chapter, 3);
		assertEqual(result.verses, [{ start: 16, end: 16 }]);
	});

	// Test verse range
	test('Parse verse range (Romans 8:28-39)', () => {
		const result = parser.parse('Romans 8:28-39');
		assertEqual(result.book, 'Romans');
		assertEqual(result.chapter, 8);
		assertEqual(result.verses, [{ start: 28, end: 39 }]);
	});

	// Test entire chapter
	test('Parse entire chapter (Psalm 23)', () => {
		const result = parser.parse('Psalm 23');
		assertEqual(result.book, 'Psalm');
		assertEqual(result.chapter, 23);
		assertEqual(result.verses, []);
	});

	// Test book with number (1 Corinthians)
	test('Parse numbered book (1 Cor 13:4-8)', () => {
		const result = parser.parse('1 Cor 13:4-8');
		assertEqual(result.book, '1 Corinthians');
		assertEqual(result.chapter, 13);
		assertEqual(result.verses, [{ start: 4, end: 8 }]);
	});

	// Test book abbreviation
	test('Parse book abbreviation (Gen 1:1)', () => {
		const result = parser.parse('Gen 1:1');
		assertEqual(result.book, 'Genesis');
		assertEqual(result.chapter, 1);
		assertEqual(result.verses, [{ start: 1, end: 1 }]);
	});

	// Test validation
	test('Validate correct reference', () => {
		const reference = parser.parse('John 3:16');
		const validation = parser.validateReference(reference);
		assertEqual(validation.valid, true);
		assertEqual(validation.errors.length, 0);
	});

	// Test validation of invalid reference
	test('Validate invalid reference', () => {
		const reference = parser.parse('Invalid 99:99');
		const validation = parser.validateReference(reference);
		assertEqual(validation.valid, false);
		assertEqual(validation.errors.length > 0, true);
	});

	return passedTests === totalTests;
}

// Export for use in main test file
export { runTests };