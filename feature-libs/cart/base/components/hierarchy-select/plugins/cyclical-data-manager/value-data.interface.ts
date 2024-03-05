/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

export interface ValueData<T> {
	parentValues: Array<T>;
	childValues: Array<T>;
	value: T;
	name: string;
}
