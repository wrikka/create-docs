/**
 * Domain events for image optimization
 */
export interface OptimizationStartedEvent {
	readonly type: "OPTIMIZATION_STARTED";
	readonly timestamp: number;
	readonly imagePath: string;
}

export interface OptimizationCompletedEvent {
	readonly type: "OPTIMIZATION_COMPLETED";
	readonly timestamp: number;
	readonly imagePath: string;
	readonly sizeReduction: number;
}

export type ImageOptimizationDomainEvent =
	| OptimizationStartedEvent
	| OptimizationCompletedEvent;

export const createOptimizationStartedEvent = (
	imagePath: string,
	now: number = Date.now(),
): OptimizationStartedEvent => ({
	type: "OPTIMIZATION_STARTED",
	timestamp: now,
	imagePath,
});

export const createOptimizationCompletedEvent = (
	imagePath: string,
	sizeReduction: number,
	now: number = Date.now(),
): OptimizationCompletedEvent => ({
	type: "OPTIMIZATION_COMPLETED",
	timestamp: now,
	imagePath,
	sizeReduction,
});
