export interface BibleReference {
	book: string;
	chapter: number;
	verses: number[] | { start: number; end: number }[];
	translation: string;
}

export interface BibleVerse {
	reference: string;
	text: string;
	translation: string;
}

export interface BibleAPIResponse {
	verses: BibleVerse[];
	canonical: string;
	passage: string;
}

// ESV API specific response types
export interface ESVAPIResponse {
	query: string;
	canonical: string;
	parsed: number[][];
	passage_meta: ESVPassageMeta[];
	passages: string[];
}

export interface ESVPassageMeta {
	canonical: string;
	chapter_start: number[];
	chapter_end: number[];
	prev_verse: number;
	next_verse: number;
	prev_chapter: number[];
	next_chapter: number[];
}

export interface ScriptureInjectorSettings {
	defaultTranslation: 'ESV' | 'NET';
	esvApiKey: string;
	showTranslationName: boolean;
	showReference: boolean;
	verseCollapse: boolean;
}

export interface BookMapping {
	fullName: string;
	abbreviations: string[];
	chapters: number;
}

export interface APIError {
	message: string;
	status?: number;
	code?: string;
}

export class BibleAPIError extends Error implements APIError {
	status?: number;
	code?: string;

	constructor(message: string, status?: number, code?: string) {
		super(message);
		this.name = 'BibleAPIError';
		this.status = status;
		this.code = code;
	}
}