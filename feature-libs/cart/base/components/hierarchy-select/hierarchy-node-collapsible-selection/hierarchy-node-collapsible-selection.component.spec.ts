/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SapIconPipe } from 'app/shared/pipes/sap-icon.pipe';
import { CollapsibleSelectionNode } from '../collapsible-selection-node.model';
import { HierarchyNode } from '../hierarchy-node.model';
import { HierarchyNodeSelectionService } from '../hierarchy-node-selection/hierarchy-node-selection.service';
import { MockHierarchyNodeSelectionService, mockValue } from '../hierarchy-node-selection/hierarchy-node-selection.service.mock';
import { HierarchyCollapsibleSelectionComponent } from './hierarchy-node-collapsible-selection.component';

describe('HierarchyCollapsibleSelectionComponent', () => {
	let component: HierarchyCollapsibleSelectionComponent<void>;
	let fixture: ComponentFixture<HierarchyCollapsibleSelectionComponent<void>>;

	let mockNodeService: HierarchyNodeSelectionService;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [HierarchyCollapsibleSelectionComponent, SapIconPipe],
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
		fixture = TestBed.createComponent<HierarchyCollapsibleSelectionComponent<void>>(HierarchyCollapsibleSelectionComponent);
		component = fixture.componentInstance;

		component.tree = new CollapsibleSelectionNode('MockCollapsibleSelectionNode', {});
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should toggle state of tree if has children', () => {
		component.tree.open = false;

		component.tree.childValues.push('mockChildValue');

		component.toggle();

		expect(component.tree.open).toBe(true);
	});

	it('should emit tree on toggle', () => {
		const expected = component.tree;
		let actual: CollapsibleSelectionNode;
		component.collapsibleToggle.subscribe((node: CollapsibleSelectionNode) => {
			actual = node;
		});

		component.tree.childValues.push('mockChildValue');

		component.toggle();

		expect(actual).toBe(expected);
	});

	it('should reflect open state of tree', () => {
		expect(component.open).toBe(component.tree.open);

		component.toggle();

		expect(component.open).toBe(component.tree.open);
	});

	it('should emit tree on selection change', () => {
		const expected = component.tree;
		let actual: CollapsibleSelectionNode;
		component.selectionToggle.subscribe((node: CollapsibleSelectionNode) => {
			actual = node;
		});

		component.selected = !component.selected;

		expect(actual).toBe(expected);
	});

	it('should reflect selected state of tree', () => {
		expect(component.selected).toBe(component.tree.selected);

		component.selected = !component.selected;

		expect(component.selected).toBe(component.tree.selected);
	});

	it('should reflect whether or not the tree has childValues or children', () => {
		expect(component.hasChildren).toBe(false);

		component.tree.childValues.push('mockChildValue');

		expect(component.hasChildren).toBe(true);

		component.tree.childValues = [];

		expect(component.hasChildren).toBe(false);

		component.tree.children.push(new HierarchyNode('mock'));

		expect(component.hasChildren).toBe(true);
	});

	it('should show appropriate checkbox label', () => {
		component.tree.unselectedCheckboxLabel = 'Select';
		component.tree.selectedCheckboxLabel = 'Deselect';

		expect(component.checkboxLabel).toEqual('Select');

		component.tree.selected = true;

		expect(component.checkboxLabel).toEqual('Deselect');
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
