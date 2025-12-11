import { BibleVerse, BibleAPIError } from '../types/bible';

export abstract class BibleAPIService {
	abstract fetchVerse(reference: string): Promise<BibleVerse>;
	
	protected handleError(error: unknown, apiName: string): never {
		// Type guard to ensure error has the expected properties
		const errorMessage = error instanceof Error ? error.message : String(error);
		
		// Type guards for status and code properties
		let status: number | undefined;
		let code: string | undefined;
		
		if (error && typeof error === 'object') {
			const errorObj = error as Record<string, unknown>;
			if ('status' in errorObj && typeof errorObj.status === 'number') {
				status = errorObj.status;
			}
			if ('code' in errorObj && typeof errorObj.code === 'string') {
				code = errorObj.code;
			}
		}
		
		const message = `Failed to fetch verse from ${apiName}: ${errorMessage}`;
		
		throw new BibleAPIError(message, status, code);
	}
}