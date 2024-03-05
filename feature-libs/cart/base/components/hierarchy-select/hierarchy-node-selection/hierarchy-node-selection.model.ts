/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

export interface HierarchySearchCriteria {
	field: string;
	value: string;
}

export interface SelectionEvent<T = string> {
	type: SelectionEventType;
	field: string;
	value: T;
}

export enum SelectionEventType {
	SELECT = 'SELECT',
	DESELECT = 'DESELECT',
}
