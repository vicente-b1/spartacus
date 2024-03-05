/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SelectionNode } from '../selection-node.model';
import { HierarchyNodeSelectionComponent } from './hierarchy-node-selection.component';
import { HierarchyNodeSelectionService } from './hierarchy-node-selection.service';
import { MockHierarchyNodeSelectionService, mockValue } from './hierarchy-node-selection.service.mock';

describe('HierarchyNodeSelectionComponent', () => {
	let component: HierarchyNodeSelectionComponent<void>;
	let fixture: ComponentFixture<HierarchyNodeSelectionComponent<void>>;

	let mockNodeService: HierarchyNodeSelectionService;

	const mockSelectionNode = new SelectionNode('L1 SelectionNode');

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [HierarchyNodeSelectionComponent],
				providers: [
					{
						provide: HierarchyNodeSelectionService,
						useClass: MockHierarchyNodeSelectionService,
					},
				],
				schemas: [NO_ERRORS_SCHEMA],
			}).compileComponents();

			mockNodeService = TestBed.inject(HierarchyNodeSelectionService);
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent<HierarchyNodeSelectionComponent<void>>(HierarchyNodeSelectionComponent);
		component = fixture.componentInstance;

		component.tree = mockSelectionNode;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit tree on selection change', () => {
		const expected = component.tree;
		let actual: SelectionNode;
		component.selectionToggle.subscribe((node: SelectionNode) => {
			actual = node;
		});

		component.selected = !component.selected;

		expect(actual).toBe(expected);
	});

	it('should reflect selected state of tree', () => {
		expect(component.selected).toBe(mockSelectionNode.selected);

		component.selected = !component.selected;

		expect(component.selected).toBe(mockSelectionNode.selected);
	});

	describe('when searchable', () => {
		beforeEach(() => {
			component.tree.searchable = true;
			component.tree.value = mockValue;
		});

		it('should subscribe on search event and set isHidden property correctly', () => {
			spyOn(mockNodeService.search, 'subscribe').and.callThrough();
			fixture.detectChanges();
			// tslint:disable-next-line:deprecation
			expect(mockNodeService.search.subscribe).toHaveBeenCalledTimes(1);
			expect(component.isHidden).toBeFalsy();
		});
	});

	describe('when being notified of selection', () => {
		beforeEach(() => {
			component.tree.notifySelection = true;
			component.tree.value = mockValue;
		});

		it("should subscribe on select event and set the tree's selected property correctly", () => {
			spyOn(mockNodeService.select, 'subscribe').and.callThrough();
			fixture.detectChanges();
			// tslint:disable-next-line:deprecation
			expect(mockNodeService.select.subscribe).toHaveBeenCalledTimes(1);
			expect(component.tree.selected).toBeFalsy();
		});
	});
});
