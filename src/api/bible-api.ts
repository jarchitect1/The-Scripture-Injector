import { BibleVerse, APIError } from '../types/bible';

export abstract class BibleAPIService {
	abstract fetchVerse(reference: string): Promise<BibleVerse>;
	
	protected handleError(error: any, apiName: string): never {
		const apiError: APIError = {
			message: `Failed to fetch verse from ${apiName}: ${error.message}`
		};
		
		if (error.status) {
			apiError.status = error.status;
		}
		
		if (error.code) {
			apiError.code = error.code;
		}
		
		throw apiError;
	}
}