import { BibleVerse, ScriptureInjectorSettings } from '../types/bible';

export class VerseFormatter {
	formatVerseForObsidian(verse: BibleVerse, settings: ScriptureInjectorSettings): string {
		const reference = verse.reference;
		const translation = verse.translation;
		
		// Store the original text before cleaning
		const text = verse.text;
		
		
		// Clean up the text but preserve verse numbers for ESV
		// const text = this.cleanVerseText(verse.text, translation);

		
		// Create quote callout with Bible icon
		// Use collapsed format if verseCollapse is enabled
		let formatted = settings.verseCollapse ? `> [!quote]- 📖` : `> [!quote] 📖`;
		
		// Add reference if enabled
		if (settings.showReference) {
			formatted += ` ${reference}`;
		}
		
		// Add translation if enabled
		if (settings.showTranslationName) {
			if (settings.showReference) {
				formatted += ` (${translation})`;
			} else {
				formatted += ` ${translation}`;
			}
		}
		
		// Add the verse text with blockquote prefix for each line
		// Split the text by lines and add blockquote prefix to each line
		const lines = text.split('\n');
		
		lines.forEach(line => {
			formatted += `\n> ${line}`;
		});
				
		return formatted + '\n\n';
	}

	formatVerseForMarkdown(verse: BibleVerse, settings: ScriptureInjectorSettings): string {
		const reference = verse.reference;
		const translation = verse.translation;
		
		// Store the original text before cleaning
		const text = verse.text;
		
		// Create a simple markdown blockquote format
		let formatted = `> 📖`;
		
		// Add reference if enabled
		if (settings.showReference) {
			formatted += ` **${reference}**`;
		}
		
		// Add translation if enabled
		if (settings.showTranslationName) {
			if (settings.showReference) {
				formatted += ` (${translation})`;
			} else {
				formatted += ` **${translation}**`;
			}
		}
		
		// Add the verse text with blockquote prefix for each line
		formatted += `\n>`;
		const lines = text.split('\n');
		lines.forEach(line => {
			formatted += `\n> ${line}`;
		});
		
		return formatted + '\n\n';
	}

	formatVerseForPlainText(verse: BibleVerse, settings: ScriptureInjectorSettings): string {
		const reference = verse.reference;
		const translation = verse.translation;
		
		// Store the original text before cleaning
		const text = verse.text;
		
		// Create a simple plain text format
		let formatted = '';
		
		// Add reference if enabled
		if (settings.showReference) {
			formatted += `${reference}`;
		}
		
		// Add translation if enabled
		if (settings.showTranslationName) {
			if (settings.showReference) {
				formatted += ` (${translation})`;
			} else {
				formatted += `${translation}`;
			}
		}
		
		// Add the verse text
		if (formatted) {
			formatted += `\n\n${text}`;
		} else {
			formatted = text;
		}
		
		return formatted + '\n\n';
	}

	// Method to clean up text from APIs (remove extra whitespace, fix formatting, etc.)
	cleanVerseText(text: string, translation?: string): string {
			
		let cleaned = text
			// Remove extra whitespace at beginning and end
			.trim();
		
		// Only remove verse numbers in brackets for non-ESV translations
		// For ESV, we want to preserve the verse numbers
		if (translation !== 'ESV') {
			cleaned = cleaned.replace(/\[\d+\]/g, ''); // Remove verse numbers in brackets
		}
		
		cleaned = cleaned
			// Fix common formatting issues from APIs
			.replace(/\(\s*ESV\s*\)$/g, '') // Remove (ESV) at the end of text
			.replace(/¶/g, '') // Remove paragraph markers
			// Replace multiple consecutive newlines with a single newline
			.replace(/\n\s*\n\s*\n/g, '\n')
			// Replace multiple spaces with single spaces
			.replace(/\s+/g, ' ')
			.trim();
			
		return cleaned;
	}

	// Method to format verse references consistently
	formatReference(book: string, chapter: number, verses: number[] | { start: number; end: number }[]): string {
		if (verses.length === 0) {
			return `${book} ${chapter}`;
		}

		if (typeof verses[0] === 'number') {
			// Handle single verses array
			const verseNumbers = verses as number[];
			if (verseNumbers.length === 1) {
				return `${book} ${chapter}:${verseNumbers[0]}`;
			} else if (verseNumbers.length === 2) {
				return `${book} ${chapter}:${verseNumbers[0]}-${verseNumbers[1]}`;
			} else {
				// For multiple verses, show as range
				return `${book} ${chapter}:${verseNumbers[0]}-${verseNumbers[verseNumbers.length - 1]}`;
			}
		} else {
			// Handle verse range objects
			const ranges = verses as { start: number; end: number }[];
			if (ranges.length === 1) {
				const range = ranges[0];
				if (range.start === range.end) {
					return `${book} ${chapter}:${range.start}`;
				} else {
					return `${book} ${chapter}:${range.start}-${range.end}`;
				}
			} else {
				// For multiple ranges, join them
				const rangeStrings = ranges.map(r => 
					r.start === r.end ? `${r.start}` : `${r.start}-${r.end}`
				);
				return `${book} ${chapter}:${rangeStrings.join(',')}`;
			}
		}
	}
}