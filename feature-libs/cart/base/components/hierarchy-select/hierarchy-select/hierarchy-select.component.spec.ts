/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA, Output, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UntypedFormBuilder } from '@angular/forms';
import { CollapsibleNode } from '../collapsible-node.model';
import { HierarchyNode } from '../hierarchy-node.model';
import { SelectionNode } from '../selection-node.model';
import { HierarchySelectComponent } from './hierarchy-select.component';

@Component({
	selector: 'app-hierarchy-node',
	template: '',
})
export class MockAppHierarchyNodeComponent {
	@Input() tree: HierarchyNode;

	@Input() paddingPrefix = 0;

	@Output()
	collapsibleToggle: EventEmitter<CollapsibleNode> = new EventEmitter<CollapsibleNode>();

	@Output()
	selectionToggle: EventEmitter<SelectionNode> = new EventEmitter<SelectionNode>();
}

describe('HierarchySelectComponent', () => {
	let component: HierarchySelectComponent<void>;
	let fixture: ComponentFixture<HierarchySelectComponent<void>>;

	beforeEach(
		waitForAsync(() => {
			TestBed.overrideComponent(HierarchySelectComponent, {
				set: {
					providers: [],
				},
			})
				.configureTestingModule({
					declarations: [HierarchySelectComponent, MockAppHierarchyNodeComponent],
					providers: [UntypedFormBuilder],
					schemas: [NO_ERRORS_SCHEMA],
				})
				.compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent<HierarchySelectComponent<void>>(HierarchySelectComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit a node on collapse event', () => {
		let collapseEvent: any;

		component.collapse.subscribe(node => (collapseEvent = node));

		const collapsibleNode = new CollapsibleNode('node', { open: true });
		component.handleCollapsibleToggle(collapsibleNode);

		expect(collapseEvent).toBe(collapsibleNode);
	});

	it('should emit all selections on selection event', () => {
		const mockSelectedNode1 = new SelectionNode('value 2', {
			selected: true,
		});
		const mockSelectedNode2 = new SelectionNode('value 3', {
			selected: true,
		});
		const expected: Array<SelectionNode> = [mockSelectedNode1, mockSelectedNode2];
		const mockTree = new HierarchyNode('root', {
			children: [new SelectionNode('value 1'), mockSelectedNode1, mockSelectedNode2],
		});
		component.tree = mockTree;
		fixture.detectChanges();

		let actual: Array<SelectionNode>;
		component.selections.subscribe((values: Array<SelectionNode>) => {
			actual = values;
		});
		component.handleSelectionToggle(mockSelectedNode1);

		expect(actual).toEqual(expected);
	});

	it('should update bottom border on tree change according to children', () => {
		const mockTreeWithoutChildren = new HierarchyNode('root w/o children');
		const mockTreeWithChildren = new HierarchyNode('root', {
			children: [new HierarchyNode('L1 Node1')],
		});

		component.tree = mockTreeWithoutChildren;
		component.ngOnChanges({
			tree: new SimpleChange(null, mockTreeWithoutChildren, false),
		});
		fixture.detectChanges();
		expect(component.showBorderBottom).toBe(true);

		component.tree = mockTreeWithChildren;
		component.ngOnChanges({
			tree: new SimpleChange(mockTreeWithoutChildren, mockTreeWithChildren, false),
		});
		fixture.detectChanges();
		expect(component.showBorderBottom).toBe(false);
	});
});
