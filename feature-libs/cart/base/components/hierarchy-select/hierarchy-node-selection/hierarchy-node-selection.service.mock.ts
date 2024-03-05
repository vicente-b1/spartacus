/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { HierarchySearchCriteria, SelectionEvent, SelectionEventType } from './hierarchy-node-selection.model';

export const mockValue = { dummyfield: 'dummy value' };

export const mockSearchCriteria: HierarchySearchCriteria = {
	field: 'dummyfield',
	value: 'dummy value',
};

export const mockSelectionEvent: SelectionEvent = {
	type: SelectionEventType.DESELECT,
	field: 'dummyfield',
	value: 'dummy value',
};

export class MockHierarchyNodeSelectionService {
	search = {
		next: () => {
			// Intentional: Mock method
		},
		subscribe: fn => of(mockSearchCriteria).pipe(tap(fn)).subscribe(),
	};

	select = {
		next: () => {
			// Intentional: Mock method
		},
		subscribe: fn => of(mockSelectionEvent).pipe(tap(fn)).subscribe(),
	};
}
