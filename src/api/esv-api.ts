import { BibleAPIService } from './bible-api';
import { BibleVerse, ESVAPIResponse } from '../types/bible';
import { requestUrl } from 'obsidian';

export class ESVAPIService extends BibleAPIService {
	private apiKey: string;
	private baseUrl = 'https://api.esv.org/v3/passage/text/';

	constructor(apiKey: string) {
		super();
		if (!apiKey) {
			throw new Error('ESV API key is required');
		}
		this.apiKey = apiKey;
	}

	async fetchVerse(reference: string): Promise<BibleVerse> {
		try {
			// Use Obsidian's requestUrl to bypass CORS restrictions
			const url = `${this.baseUrl}?q=${encodeURIComponent(reference)}`;


			const response = await requestUrl({
				url: url,
				method: 'GET',
				headers: {
					'Authorization': `Token ${this.apiKey}`
				}
			});


			if (response.status !== 200) {
				throw new Error(`ESV API error: ${response.status}`);
			}

			// Parse the JSON response (ESV API returns JSON)
			try {
				const jsonResponse: ESVAPIResponse = JSON.parse(response.text);
				
				// Check if passages array exists and has content
				if (!jsonResponse.passages || !Array.isArray(jsonResponse.passages) || jsonResponse.passages.length === 0) {
					throw new Error('No passages found in ESV API response');
				}

				// Extract verse text from the first passage
				let passageText = jsonResponse.passages[0].trim();
				
				
				// Use canonical reference if available, otherwise use the original reference
				const canonicalReference = jsonResponse.canonical || reference;
				
				// Apply formatting changes as requested:
				// 1. Remove the first line (e.g., "Genesis 1:1-6")
				// 2. Remove the last line (e.g., "(ESV)")
				// 3. Change '[' to '<sup>'
				// 4. Change ']' to '</sup>'
				
				// Split into lines and process
				const lines = passageText.split('\n');
				
				// Remove first line (reference) and last line (translation abbreviation)
				if (lines.length > 2) {
					lines.shift(); // Remove first line
					lines.pop();   // Remove last line
				}
				
				// Rejoin the lines
				passageText = lines.join('\n').trim();
				
				// Replace square brackets with HTML sup tags
				passageText = passageText.replace(/\[/g, '<sup>').replace(/\]/g, '</sup>');
				

				return {
					reference: canonicalReference,
					text: passageText,
					translation: 'ESV'
				};
			} catch (parseError) {
				throw new Error('Failed to parse ESV API response');
			}
		} catch (error) {
			this.handleError(error, 'ESV API');
		}
	}

	async testConnection(): Promise<boolean> {
		try {
			// Test with a simple request to verify API key works
			const response = await requestUrl({
				url: `${this.baseUrl}?q=John+3:16`,
				method: 'GET',
				headers: {
					'Authorization': `Token ${this.apiKey}`
				}
			});
			
			if (response.status !== 200) {
				return false;
			}
			
			// Verify we can parse the JSON response
			try {
				const jsonResponse = JSON.parse(response.text);
				return jsonResponse.passages && Array.isArray(jsonResponse.passages) && jsonResponse.passages.length > 0;
			} catch {
				return false;
			}
		} catch (error) {
			return false;
		}
	}
}