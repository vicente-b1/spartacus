/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { TestBed, inject } from '@angular/core/testing';

import { HierarchyNodeSelectionService } from './hierarchy-node-selection.service';

describe('HierarchyNodeSelectionService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [HierarchyNodeSelectionService],
		});
	});

	it('should be created', inject([HierarchyNodeSelectionService], (service: HierarchyNodeSelectionService) => {
		expect(service).toBeTruthy();
	}));
});
