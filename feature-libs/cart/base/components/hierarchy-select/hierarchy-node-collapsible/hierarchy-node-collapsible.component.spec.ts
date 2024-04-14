/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';

import { CollapsibleNode } from '../collapsible-node.model';
import { NodeEventType } from '../events';
import { HierarchyNodeCollapsibleComponent } from './hierarchy-node-collapsible.component';

describe('HierarchyNodeCollapsibleComponent', () => {
	let component: HierarchyNodeCollapsibleComponent<void>;
	let fixture: ComponentFixture<HierarchyNodeCollapsibleComponent<void>>;

	const mockCollapsibleNode = new CollapsibleNode<void>('L1 CollapsibleNode');

	beforeEach(
		waitForAsync(() => {
			TestBed.overrideComponent(HierarchyNodeCollapsibleComponent, {
				set: {
					providers: [],
				},
			})
				.configureTestingModule({
					declarations: [HierarchyNodeCollapsibleComponent],
					providers: [],
					schemas: [NO_ERRORS_SCHEMA],
				})
				.compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent<HierarchyNodeCollapsibleComponent<void>>(HierarchyNodeCollapsibleComponent);
		component = fixture.componentInstance;

		component.tree = mockCollapsibleNode;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should toggle state of tree', () => {
		const oldValue = mockCollapsibleNode.open;

		component.toggle();

		expect(mockCollapsibleNode.open).toBe(!oldValue);
	});

	it('should emit tree on toggle', () => {
		const expected = component.tree;
		let actual: CollapsibleNode;
		component.collapsibleToggle.subscribe((node: CollapsibleNode) => {
			actual = node;
		});

		component.toggle();

		expect(actual).toBe(expected);
	});

	it('should reflect open state of tree', () => {
		expect(component.open).toBe(mockCollapsibleNode.open);

		component.toggle();

		expect(component.open).toBe(mockCollapsibleNode.open);
	});

	it('should lazy load children', () => {
		const lazyLoad = new Subject<Array<CollapsibleNode<string>>>();

		mockCollapsibleNode.lazyLoadFactory = jasmine.createSpy('lazyLoadFactory').and.callFake(node => {
			expect(node).toBe(mockCollapsibleNode);
			return lazyLoad;
		});

		fixture.detectChanges();

		let event;
		const subscription = component.event.subscribe(e => (event = e));

		mockCollapsibleNode.disabled = false;
		mockCollapsibleNode.open = false;

		component.toggle();

		expect(mockCollapsibleNode.lazyLoadFactory).toHaveBeenCalledWith(mockCollapsibleNode);

		lazyLoad.next([new CollapsibleNode(null, { value: 'foo' }), new CollapsibleNode(null, { value: 'bar' }), new CollapsibleNode(null, { value: 'baz' })]);

		expect(mockCollapsibleNode.children).toEqual([
			new CollapsibleNode(null, { value: 'foo' }),
			new CollapsibleNode(null, { value: 'bar' }),
			new CollapsibleNode(null, { value: 'baz' }),
		]);
		expect(event).toEqual({
			node: mockCollapsibleNode,
			children: [new CollapsibleNode(null, { value: 'foo' }), new CollapsibleNode(null, { value: 'bar' }), new CollapsibleNode(null, { value: 'baz' })],
			type: NodeEventType.LOAD_CHILDREN,
		});

		lazyLoad.next([new CollapsibleNode(null, { value: 'refreshed foo' }), new CollapsibleNode(null, { value: 'refreshed bar' })]);

		expect(mockCollapsibleNode.children).toEqual([new CollapsibleNode(null, { value: 'refreshed foo' }), new CollapsibleNode(null, { value: 'refreshed bar' })]);
		expect(event).toEqual({
			node: mockCollapsibleNode,
			children: [new CollapsibleNode(null, { value: 'refreshed foo' }), new CollapsibleNode(null, { value: 'refreshed bar' })],
			type: NodeEventType.LOAD_CHILDREN,
		});

		lazyLoad.complete();
		subscription.unsubscribe();
	});
});
