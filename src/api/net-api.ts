import { BibleAPIService } from './bible-api';
import { BibleVerse } from '../types/bible';

export class NETBibleAPIService extends BibleAPIService {
	private baseUrl = 'https://labs.bible.org/api/?';

	async fetchVerse(reference: string): Promise<BibleVerse> {
		try {
			const url = `${this.baseUrl}passage=${encodeURIComponent(reference)}&formatting=para`;
			
			const response = await fetch(url);
			
			if (!response.ok) {
				throw new Error(`NET Bible API error: ${response.statusText}`);
			}

			const text = await response.text();
			
			if (!text || text.trim().length === 0) {
				throw new Error('No passage found for the given reference');
			}

			// Parse the reference to extract book name and chapter
			const referenceMatch = reference.match(/^(\d?\s?\w+)\s+(\d+):/);
			if (!referenceMatch) {
				const chapterOnlyMatch = reference.match(/^(\d?\s?\w+)\s+(\d+)$/);
				if (!chapterOnlyMatch) {
					throw new Error('Invalid reference format');
				}
				// Handle chapter-only reference
				const bookName = chapterOnlyMatch[1].trim();
				const chapter = chapterOnlyMatch[2];
				
				// For chapter-only references, we need to extract verse numbers from the HTML response
				// Look for verse numbers in the format: <b>3:1</b> or <b>1</b>
				const verseNumberPattern = /<b>(\d+(?::\d+)?|\d+)<\/b>/g;
				const verseNumbers: number[] = [];
				let match;
				while ((match = verseNumberPattern.exec(text)) !== null) {
					const num = match[1].includes(':') ? parseInt(match[1].split(':')[1]) : parseInt(match[1]);
					if (!isNaN(num)) {
						verseNumbers.push(num);
					}
				}
				
				// Create a proper reference format
				let formattedReference = `${bookName} ${chapter}`;
				if (verseNumbers.length > 1) {
					formattedReference += `:${verseNumbers[0]}-${verseNumbers[verseNumbers.length - 1]}`;
				} else if (verseNumbers.length === 1) {
					formattedReference += `:${verseNumbers[0]}`;
				}
				
				// Convert HTML to Markdown
				// Replace <b> tags with ** for bold
				let markdownText = text
					.replace(/<b>/g, '<sup>')
					.replace(/<\/b>/g, '</sup>')
					// Replace <p class="bodytext"> with empty string (paragraph start)
					.replace(/<p[^>]*>/g, '')
					// Replace </p> with double newline for paragraph separation
					.replace(/<\/p>/g, '\n\n');
					//.trim();
				

				const result = {
					reference: formattedReference,
					text: markdownText,
					translation: 'NET'
				};
				
				return result;
			}
			
			const bookName = referenceMatch[1].trim();
			const chapter = referenceMatch[2];
			
			// Extract verse numbers from the HTML response
			// Look for verse numbers in the format: <b>3:1</b> or <b>2</b>
			const verseNumberPattern = /<b>(\d+(?::\d+)?|\d+)<\/b>/g;
			const verseNumbers: number[] = [];
			let match;
			while ((match = verseNumberPattern.exec(text)) !== null) {
				const num = match[1].includes(':') ? parseInt(match[1].split(':')[1]) : parseInt(match[1]);
				if (!isNaN(num)) {
					verseNumbers.push(num);
				}
			}
			
			// Create a proper reference format
			let formattedReference = `${bookName} ${chapter}`;
			if (verseNumbers.length === 1) {
				formattedReference += `:${verseNumbers[0]}`;
			} else if (verseNumbers.length > 1) {
				formattedReference += `:${verseNumbers[0]}-${verseNumbers[verseNumbers.length - 1]}`;
			}
			
			// Convert HTML to Markdown
			// Replace <b> tags with ** for bold
			let markdownText = text
				.replace(/<b>/g, '<sup>')
				.replace(/<\/b>/g, '</sup>')
				// Replace <p class="bodytext"> with empty string (paragraph start)
				.replace(/<p[^>]*>/g, '')
				// Replace </p> with double newline for paragraph separation
				.replace(/<\/p>/g, '\n\n')
				.trim();
			

			const result = {
				reference: formattedReference,
				text: markdownText,
				translation: 'NET'
			};
			
			return result;
		} catch (error) {
			this.handleError(error, 'NET Bible API');
		}
	}

	async testConnection(): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}passage=John%203:16`);
			return response.ok;
		} catch {
			return false;
		}
	}

	// NET Bible API has some limitations, this method helps validate references
	validateReference(reference: string): boolean {
		// NET Bible API works best with standard book names and chapter:verse format
		// It may not handle complex references as well as ESV
		return /^[1-3]?\s?\w+\s+\d+:\d+(?:-\d+)?$/.test(reference.trim());
	}
}