/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { HierarchySearchCriteria, SelectionEvent } from './hierarchy-node-selection.model';

@Injectable({
	providedIn: 'root',
})
export class HierarchyNodeSelectionService {
	search = new Subject<HierarchySearchCriteria>();

	select = new Subject<SelectionEvent>();
}
