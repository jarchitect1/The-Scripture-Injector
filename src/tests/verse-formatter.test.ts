import { VerseFormatter } from '../formatter/verse-formatter';
import { BibleVerse, ScriptureInjectorSettings } from '../types/bible';

// Simple test runner for the verse formatter
function runTests() {
	const formatter = new VerseFormatter();
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
		if (actual !== expected) {
			throw new Error(message || `Expected "${expected}", got "${actual}"`);
		}
	}

	// Test settings
	const settings: ScriptureInjectorSettings = {
		defaultTranslation: 'ESV',
		esvApiKey: 'test-key',
		showReference: true,
		showTranslationName: true,
		verseCollapse: false
	};

	// Test multi-line verse formatting for Obsidian
	test('Format multi-line verse for Obsidian', () => {
		const verse: BibleVerse = {
			reference: 'John 3:16',
			text: 'John 3:16\n\nFor God So Loved the World\n\n[16] "For God so loved the world,(1) that he gave his only Son, that whoever believes in him should not perish but have eternal life.\n\nFootnotes\n\n(1) 3:16 Or *For this is how God loved the world*\n(ESV)',
			translation: 'ESV'
		};

		const result = formatter.formatVerseForObsidian(verse, settings);
		
		// Check that each line has the blockquote prefix
		const lines = result.split('\n');
		assertEqual(lines[0], '> [!quote] 📖 John 3:16 (ESV)');
		assertEqual(lines[1], '> John 3:16');
		assertEqual(lines[2], '> ');
		assertEqual(lines[3], '> For God So Loved the World');
		assertEqual(lines[4], '> ');
		assertEqual(lines[5], '> [16] "For God so loved the world,(1) that he gave his only Son, that whoever believes in him should not perish but have eternal life.');
		assertEqual(lines[6], '> ');
		assertEqual(lines[7], '> Footnotes');
		assertEqual(lines[8], '> ');
		assertEqual(lines[9], '> (1) 3:16 Or *For this is how God loved the world*');
		assertEqual(lines[10], '> (ESV)');
	});

	// Test multi-line verse formatting for Markdown
	test('Format multi-line verse for Markdown', () => {
		const verse: BibleVerse = {
			reference: 'John 3:16',
			text: 'John 3:16\n\nFor God So Loved the World\n\n[16] "For God so loved the world,(1) that he gave his only Son, that whoever believes in him should not perish but have eternal life.\n\nFootnotes\n\n(1) 3:16 Or *For this is how God loved the world*\n(ESV)',
			translation: 'ESV'
		};

		const result = formatter.formatVerseForMarkdown(verse, settings);
		
		// Check that each line has the blockquote prefix
		const lines = result.split('\n');
		assertEqual(lines[0], '> 📖 **John 3:16** (ESV)');
		assertEqual(lines[1], '>');
		assertEqual(lines[2], '> John 3:16');
		assertEqual(lines[3], '> ');
		assertEqual(lines[4], '> For God So Loved the World');
		assertEqual(lines[5], '> ');
		assertEqual(lines[6], '> [16] "For God so loved the world,(1) that he gave his only Son, that whoever believes in him should not perish but have eternal life.');
		assertEqual(lines[7], '> ');
		assertEqual(lines[8], '> Footnotes');
		assertEqual(lines[9], '> ');
		assertEqual(lines[10], '> (1) 3:16 Or *For this is how God loved the world*');
		assertEqual(lines[11], '> (ESV)');
	});

	// Test verse collapse functionality
	test('Format verse with collapse enabled', () => {
		const collapseSettings: ScriptureInjectorSettings = {
			defaultTranslation: 'ESV',
			esvApiKey: 'test-key',
			showReference: true,
			showTranslationName: true,
			verseCollapse: true
		};

		const verse: BibleVerse = {
			reference: 'John 3:16',
			text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
			translation: 'ESV'
		};

		const result = formatter.formatVerseForObsidian(verse, collapseSettings);
		
		// Check that the callout has the collapse modifier
		const lines = result.split('\n');
		assertEqual(lines[0], '> [!quote]- 📖 John 3:16 (ESV)');
		assertEqual(lines[1], '> For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.');
	});

	test('Format verse with collapse disabled', () => {
		const noCollapseSettings: ScriptureInjectorSettings = {
			defaultTranslation: 'ESV',
			esvApiKey: 'test-key',
			showReference: true,
			showTranslationName: true,
			verseCollapse: false
		};

		const verse: BibleVerse = {
			reference: 'John 3:16',
			text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
			translation: 'ESV'
		};

		const result = formatter.formatVerseForObsidian(verse, noCollapseSettings);
		
		// Check that the callout does not have the collapse modifier
		const lines = result.split('\n');
		assertEqual(lines[0], '> [!quote] 📖 John 3:16 (ESV)');
		assertEqual(lines[1], '> For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.');
	});

	return passedTests === totalTests;
}

// Export for use in main test file
export { runTests };