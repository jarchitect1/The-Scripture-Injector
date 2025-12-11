import { BibleReference, BookMapping } from '../types/bible';

export class BibleReferenceParser {
	private bookNames: Map<string, string> = new Map();
	private bookAbbreviations: Map<string, string> = new Map();
	private bookData: Map<string, BookMapping> = new Map();

	constructor() {
		this.initializeBookMappings();
	}

	parse(reference: string): BibleReference {
		const trimmedRef = reference.trim();
		
		// Handle different reference formats:
		// "John 3:16"
		// "Romans 8:28-39"
		// "Genesis 1:1-2:3"
		// "1 Cor 13:4-8"
		// "John 3"
		// "Psalm 23"
		
		// Try to match chapter:verse format first
		const chapterVerseRegex = /^(\d?\s?\w+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?(?:-(\d+):(\d+))?$/i;
		const match = trimmedRef.match(chapterVerseRegex);
		
		if (!match) {
			// Try to match just book and chapter (e.g., "John 3", "Psalm 23")
			const bookChapterRegex = /^(\d?\s?\w+)\s+(\d+)$/i;
			const bookChapterMatch = trimmedRef.match(bookChapterRegex);
			
			if (bookChapterMatch) {
				const book = this.normalizeBookName(bookChapterMatch[1]);
				const chapter = parseInt(bookChapterMatch[2]);
				
				return {
					book,
					chapter,
					verses: [], // Empty verses array means entire chapter
					translation: '' // Will be set later
				};
			}
			
			throw new Error(`Invalid Bible reference format: "${reference}"`);
		}

		const book = this.normalizeBookName(match[1]);
		const chapter = parseInt(match[2]);
		
		// Handle chapter ranges (e.g., Genesis 1:1-2:3)
		if (match[5] && match[6]) {
			const endVerseInChapter = parseInt(match[6]);
			const startVerse = parseInt(match[3] || '1');
			
			return {
				book,
				chapter,
				verses: [{ start: startVerse, end: endVerseInChapter }],
				translation: '' // Will be set later
			};
		}

		// Handle single verse or verse range within a chapter
		if (match[3]) {
			const startVerse = parseInt(match[3]);
			const endVerse = match[4] ? parseInt(match[4]) : startVerse;
			
			return {
				book,
				chapter,
				verses: [{ start: startVerse, end: endVerse }],
				translation: '' // Will be set later
			};
		}

		// Just book and chapter (e.g., "John 3")
		return {
			book,
			chapter,
			verses: [], // Empty verses array means entire chapter
			translation: '' // Will be set later
		};
	}

	normalizeBookName(name: string): string {
		const normalized = name.trim().toLowerCase().replace(/\s+/g, '');
		
		// Check exact match first
		if (this.bookNames.has(normalized)) {
			return this.bookNames.get(normalized)!;
		}
		
		// Check abbreviations
		if (this.bookAbbreviations.has(normalized)) {
			return this.bookAbbreviations.get(normalized)!;
		}
		
		// Try to find partial matches for abbreviations
		for (const [abbr, fullName] of this.bookAbbreviations) {
			if (normalized.startsWith(abbr) || abbr.startsWith(normalized)) {
				return fullName;
			}
		}
		
		// If no match found, return the original name (might be a valid book name)
		return name.trim();
	}

	getBookInfo(bookName: string): BookMapping | null {
		const normalizedName = this.normalizeBookName(bookName);
		return this.bookData.get(normalizedName) || null;
	}

	validateReference(reference: BibleReference): { valid: boolean; errors: string[] } {
		const errors: string[] = [];
		
		// Check if book exists
		const bookInfo = this.getBookInfo(reference.book);
		if (!bookInfo) {
			errors.push(`Unknown book: "${reference.book}"`);
			return { valid: false, errors };
		}
		
		// Check chapter range
		if (reference.chapter < 1 || reference.chapter > bookInfo.chapters) {
			errors.push(`Invalid chapter ${reference.chapter} for ${reference.book}. Book has ${bookInfo.chapters} chapters.`);
		}
		
		// Check verse ranges
		for (const verseRange of reference.verses) {
			if (typeof verseRange === 'object') {
				if (verseRange.start < 1 || verseRange.end < verseRange.start) {
					errors.push(`Invalid verse range: ${verseRange.start}-${verseRange.end}`);
				}
			}
		}
		
		return { valid: errors.length === 0, errors };
	}

	private initializeBookMappings(): void {
		// Initialize book name mappings and data
		const books: BookMapping[] = [
			{ fullName: 'Genesis', abbreviations: ['gen', 'ge', 'gn'], chapters: 50 },
			{ fullName: 'Exodus', abbreviations: ['exod', 'ex', 'exo'], chapters: 40 },
			{ fullName: 'Leviticus', abbreviations: ['lev', 'le', 'lv'], chapters: 27 },
			{ fullName: 'Numbers', abbreviations: ['num', 'nu', 'nm'], chapters: 36 },
			{ fullName: 'Deuteronomy', abbreviations: ['deut', 'de', 'dt'], chapters: 34 },
			{ fullName: 'Joshua', abbreviations: ['josh', 'jos', 'jsh'], chapters: 24 },
			{ fullName: 'Judges', abbreviations: ['judg', 'jdg', 'jdgs'], chapters: 21 },
			{ fullName: 'Ruth', abbreviations: ['ruth', 'ru', 'rt'], chapters: 4 },
			{ fullName: '1 Samuel', abbreviations: ['1sam', '1sa', '1sm'], chapters: 31 },
			{ fullName: '2 Samuel', abbreviations: ['2sam', '2sa', '2sm'], chapters: 24 },
			{ fullName: '1 Kings', abbreviations: ['1kgs', '1ki', '1k'], chapters: 22 },
			{ fullName: '2 Kings', abbreviations: ['2kgs', '2ki', '2k'], chapters: 25 },
			{ fullName: '1 Chronicles', abbreviations: ['1chr', '1ch', '1cr'], chapters: 29 },
			{ fullName: '2 Chronicles', abbreviations: ['2chr', '2ch', '2cr'], chapters: 36 },
			{ fullName: 'Ezra', abbreviations: ['ezra', 'ezr'], chapters: 10 },
			{ fullName: 'Nehemiah', abbreviations: ['neh', 'ne', 'nh'], chapters: 13 },
			{ fullName: 'Esther', abbreviations: ['esth', 'est', 'es'], chapters: 10 },
			{ fullName: 'Job', abbreviations: ['job'], chapters: 42 },
			{ fullName: 'Psalm', abbreviations: ['ps', 'psalm'], chapters: 150 },
			{ fullName: 'Proverbs', abbreviations: ['prov', 'pr', 'prv'], chapters: 31 },
			{ fullName: 'Ecclesiastes', abbreviations: ['eccl', 'ecc', 'ec'], chapters: 12 },
			{ fullName: 'Song of Solomon', abbreviations: ['song', 'ss', 'canticles'], chapters: 8 },
			{ fullName: 'Isaiah', abbreviations: ['isa', 'is'], chapters: 66 },
			{ fullName: 'Jeremiah', abbreviations: ['jer', 'je', 'jr'], chapters: 52 },
			{ fullName: 'Lamentations', abbreviations: ['lam', 'la'], chapters: 5 },
			{ fullName: 'Ezekiel', abbreviations: ['ezek', 'eze', 'ez'], chapters: 48 },
			{ fullName: 'Daniel', abbreviations: ['dan', 'da', 'dn'], chapters: 12 },
			{ fullName: 'Hosea', abbreviations: ['hos', 'ho'], chapters: 14 },
			{ fullName: 'Joel', abbreviations: ['joel', 'jl'], chapters: 3 },
			{ fullName: 'Amos', abbreviations: ['amos', 'am'], chapters: 9 },
			{ fullName: 'Obadiah', abbreviations: ['obad', 'ob'], chapters: 1 },
			{ fullName: 'Jonah', abbreviations: ['jonah', 'jon', 'jnh'], chapters: 4 },
			{ fullName: 'Micah', abbreviations: ['mic', 'mi'], chapters: 7 },
			{ fullName: 'Nahum', abbreviations: ['nah', 'na'], chapters: 3 },
			{ fullName: 'Habakkuk', abbreviations: ['hab', 'ha'], chapters: 3 },
			{ fullName: 'Zephaniah', abbreviations: ['zeph', 'zep'], chapters: 3 },
			{ fullName: 'Haggai', abbreviations: ['hag', 'hg'], chapters: 2 },
			{ fullName: 'Zechariah', abbreviations: ['zech', 'zec'], chapters: 14 },
			{ fullName: 'Malachi', abbreviations: ['mal', 'ml'], chapters: 4 },
			{ fullName: 'Matthew', abbreviations: ['matt', 'mt'], chapters: 28 },
			{ fullName: 'Mark', abbreviations: ['mark', 'mk', 'mr'], chapters: 16 },
			{ fullName: 'Luke', abbreviations: ['luke', 'lk'], chapters: 24 },
			{ fullName: 'John', abbreviations: ['john', 'jn'], chapters: 21 },
			{ fullName: 'Acts', abbreviations: ['acts', 'ac'], chapters: 28 },
			{ fullName: 'Romans', abbreviations: ['rom', 'ro', 'rm'], chapters: 16 },
			{ fullName: '1 Corinthians', abbreviations: ['1cor', '1co', '1cr'], chapters: 16 },
			{ fullName: '2 Corinthians', abbreviations: ['2cor', '2co', '2cr'], chapters: 13 },
			{ fullName: 'Galatians', abbreviations: ['gal', 'ga'], chapters: 6 },
			{ fullName: 'Ephesians', abbreviations: ['eph', 'ep'], chapters: 6 },
			{ fullName: 'Philippians', abbreviations: ['phil', 'php', 'pp'], chapters: 4 },
			{ fullName: 'Colossians', abbreviations: ['col', 'co'], chapters: 4 },
			{ fullName: '1 Thessalonians', abbreviations: ['1thess', '1th', '1thes'], chapters: 5 },
			{ fullName: '2 Thessalonians', abbreviations: ['2thess', '2th', '2thes'], chapters: 3 },
			{ fullName: '1 Timothy', abbreviations: ['1tim', '1ti', '1tm'], chapters: 6 },
			{ fullName: '2 Timothy', abbreviations: ['2tim', '2ti', '2tm'], chapters: 4 },
			{ fullName: 'Titus', abbreviations: ['titus', 'tit', 'ti'], chapters: 3 },
			{ fullName: 'Philemon', abbreviations: ['philem', 'phm', 'pm'], chapters: 1 },
			{ fullName: 'Hebrews', abbreviations: ['heb', 'he'], chapters: 13 },
			{ fullName: 'James', abbreviations: ['jas', 'jam', 'jm'], chapters: 5 },
			{ fullName: '1 Peter', abbreviations: ['1pet', '1pe', '1pt'], chapters: 5 },
			{ fullName: '2 Peter', abbreviations: ['2pet', '2pe', '2pt'], chapters: 3 },
			{ fullName: '1 John', abbreviations: ['1john', '1jn', '1j'], chapters: 5 },
			{ fullName: '2 John', abbreviations: ['2john', '2jn', '2j'], chapters: 1 },
			{ fullName: '3 John', abbreviations: ['3john', '3jn', '3j'], chapters: 1 },
			{ fullName: 'Jude', abbreviations: ['jude', 'jud', 'jd'], chapters: 1 },
			{ fullName: 'Revelation', abbreviations: ['rev', 're', 'rv'], chapters: 22 }
		];

		// Populate maps
		for (const book of books) {
			const normalizedName = book.fullName.toLowerCase().replace(/\s+/g, '');
			this.bookNames.set(normalizedName, book.fullName);
			this.bookData.set(book.fullName, book);

			// Add abbreviations
			for (const abbr of book.abbreviations) {
				const normalizedAbbr = abbr.toLowerCase().replace(/\s+/g, '');
				this.bookAbbreviations.set(normalizedAbbr, book.fullName);
			}
		}
	}
}