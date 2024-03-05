/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CollapsibleSelectionNode } from '../../collapsible-selection-node.model';
import { CyclicalDataManager } from '..';
import { HierarchyNode } from '../..';
import { HierarchySelectEventType } from '../../hierarchy-select/hierarchy-select-event.enum';
import { ValueData } from './value-data.interface';

describe('CyclicalDataManager', () => {
	let cyclicalDataManagerPlugin: CyclicalDataManager<string>;

	let valueData1: ValueData<string>;
	let valueData2: ValueData<string>;
	let valueData3: ValueData<string>;
	let valueData4: ValueData<string>;
	let valueData5: ValueData<string>;
	let valueData6: ValueData<string>;

	const newCollapsibleSelectionNode = (valueData: ValueData<any>, overrides: Partial<CollapsibleSelectionNode> = {}): CollapsibleSelectionNode =>
		new CollapsibleSelectionNode(valueData.name, {
			...valueData,
			unselectedCheckboxLabel: 'Select all',
			selectedCheckboxLabel: 'Deselect all',
			...overrides,
		});

	beforeEach(() => {
		valueData1 = {
			value: 'node1',
			parentValues: [],
			childValues: ['node2', 'node3'],
			name: 'node1',
		};
		valueData2 = {
			value: 'node2',
			parentValues: ['node1'],
			childValues: ['node3', 'node4'],
			name: 'node2',
		};
		valueData3 = {
			value: 'node3',
			parentValues: ['node2'],
			childValues: ['node4', 'node5'],
			name: 'node3',
		};
		valueData4 = {
			value: 'node4',
			parentValues: ['node3'],
			childValues: ['node5', 'node6'],
			name: 'node4',
		};
		valueData5 = {
			value: 'node5',
			parentValues: ['node4'],
			childValues: ['node6'],
			name: 'node5',
		};
		valueData6 = {
			value: 'node6',
			parentValues: ['node5'],
			childValues: [],
			name: 'node6',
		};

		cyclicalDataManagerPlugin = new CyclicalDataManager<string>({
			allValueData: [valueData1, valueData2, valueData3, valueData4, valueData5, valueData6],
			firstLevelValueData: [valueData1],
		});
	});

	describe('load', () => {
		it('should create first level of nodes with provided data', () => {
			const root = new HierarchyNode();
			cyclicalDataManagerPlugin.callback(undefined, root, HierarchySelectEventType.LOAD);

			expect(root.children).toEqual([newCollapsibleSelectionNode(valueData1, { parent: root })]);
		});
	});

	describe('expand/collapse', () => {
		it('should expand node and load new children', () => {
			const root = new HierarchyNode();
			cyclicalDataManagerPlugin.callback(undefined, root, HierarchySelectEventType.LOAD);
			(root.children[0] as CollapsibleSelectionNode).open = true;
			cyclicalDataManagerPlugin.callback(root.children[0] as CollapsibleSelectionNode, root, HierarchySelectEventType.COLLAPSE);

			expect(root.children).toEqual([
				newCollapsibleSelectionNode(valueData1, {
					open: true,
					children: [newCollapsibleSelectionNode(valueData2), newCollapsibleSelectionNode(valueData3)],
					parent: root,
				}),
			]);
		});

		it('should do nothing if current node has not yet been set to open', () => {
			const root = new HierarchyNode();
			cyclicalDataManagerPlugin.callback(undefined, root, HierarchySelectEventType.LOAD);
			cyclicalDataManagerPlugin.callback(root.children[0] as CollapsibleSelectionNode, root, HierarchySelectEventType.COLLAPSE);

			expect(root.children).toEqual([newCollapsibleSelectionNode(valueData1, { parent: root })]);
		});

		it('should close node, but preserve children', () => {
			const root = new HierarchyNode();
			cyclicalDataManagerPlugin.callback(undefined, root, HierarchySelectEventType.LOAD);
			(root.children[0] as CollapsibleSelectionNode).open = true;
			cyclicalDataManagerPlugin.callback(root.children[0] as CollapsibleSelectionNode, root, HierarchySelectEventType.COLLAPSE);
			(root.children[0] as CollapsibleSelectionNode).open = false;
			cyclicalDataManagerPlugin.callback(root.children[0] as CollapsibleSelectionNode, root, HierarchySelectEventType.COLLAPSE);

			expect(root.children).toEqual([
				newCollapsibleSelectionNode(valueData1, {
					open: false,
					children: [newCollapsibleSelectionNode(valueData2), newCollapsibleSelectionNode(valueData3)],
					parent: root,
				}),
			]);
		});
	});

	describe('hierarchy node selection', () => {
		it('should load new node as selected if its value is in selectedValues array', () => {
			cyclicalDataManagerPlugin = new CyclicalDataManager<string>({
				allValueData: [valueData1, valueData2, valueData3, valueData4, valueData5, valueData6],
				firstLevelValueData: [valueData1],
				selectedValues: [valueData1.value, valueData3.value],
			});

			const root = new HierarchyNode();
			cyclicalDataManagerPlugin.callback(undefined, root, HierarchySelectEventType.LOAD);

			expect(root.children).toEqual([
				newCollapsibleSelectionNode(valueData1, {
					selected: true,
					parent: root,
				}),
			]);
		});

		it('should add all recursively selected child values to selectedValues array', () => {
			const root = new HierarchyNode();
			cyclicalDataManagerPlugin.callback(undefined, root, HierarchySelectEventType.LOAD);
			(root.children[0] as CollapsibleSelectionNode).selected = true;
			cyclicalDataManagerPlugin.callback(root.children[0] as CollapsibleSelectionNode, root, HierarchySelectEventType.SELECT);

			expect(cyclicalDataManagerPlugin.getSelectedValues()).toEqual(['node1', 'node2', 'node3', 'node4', 'node5', 'node6']);
		});

		it('should deselect node value and all child values on deselect event', () => {
			const root = new HierarchyNode();
			cyclicalDataManagerPlugin.callback(undefined, root, HierarchySelectEventType.LOAD);
			(root.children[0] as CollapsibleSelectionNode).selected = true;
			cyclicalDataManagerPlugin.callback(root.children[0] as CollapsibleSelectionNode, root, HierarchySelectEventType.SELECT);
			(root.children[0] as CollapsibleSelectionNode).selected = false;
			cyclicalDataManagerPlugin.callback(root.children[0] as CollapsibleSelectionNode, root, HierarchySelectEventType.SELECT);

			expect(cyclicalDataManagerPlugin.getSelectedValues()).toEqual([]);
		});

		it('should not select child values recursively if selectDescendants is false', () => {
			cyclicalDataManagerPlugin = new CyclicalDataManager<string>({
				allValueData: [valueData1, valueData2, valueData3, valueData4, valueData5, valueData6],
				firstLevelValueData: [valueData1],
				selectDescendants: false,
			});

			const root = new HierarchyNode();
			cyclicalDataManagerPlugin.callback(undefined, root, HierarchySelectEventType.LOAD);

			(root.children[0] as CollapsibleSelectionNode).selected = true;
			cyclicalDataManagerPlugin.callback(root.children[0] as CollapsibleSelectionNode, root, HierarchySelectEventType.SELECT);

			expect(cyclicalDataManagerPlugin.getSelectedValues()).toEqual(['node1']);
		});

		it('should update all previously loaded nodes to reflect a new selection', () => {
			const root = new HierarchyNode();
			cyclicalDataManagerPlugin.callback(undefined, root, HierarchySelectEventType.LOAD);
			(root.children[0] as CollapsibleSelectionNode).open = true;
			cyclicalDataManagerPlugin.callback(root.children[0] as CollapsibleSelectionNode, root, HierarchySelectEventType.COLLAPSE);
			(root.children[0].children[0] as CollapsibleSelectionNode).open = true;
			cyclicalDataManagerPlugin.callback(root.children[0].children[0] as CollapsibleSelectionNode, root, HierarchySelectEventType.COLLAPSE);
			(root.children[0].children[1] as CollapsibleSelectionNode).open = true;
			cyclicalDataManagerPlugin.callback(root.children[0].children[1] as CollapsibleSelectionNode, root, HierarchySelectEventType.COLLAPSE);
			(root.children[0].children[0].children[1] as CollapsibleSelectionNode).selected = true;
			cyclicalDataManagerPlugin.callback(root.children[0].children[0].children[1] as CollapsibleSelectionNode, root, HierarchySelectEventType.SELECT);

			expect(root.children).toEqual([
				newCollapsibleSelectionNode(valueData1, {
					open: true,
					children: [
						newCollapsibleSelectionNode(valueData2, {
							open: true,
							children: [
								newCollapsibleSelectionNode(valueData3),
								newCollapsibleSelectionNode(valueData4, {
									selected: true,
								}),
							],
						}),
						newCollapsibleSelectionNode(valueData3, {
							open: true,
							children: [
								newCollapsibleSelectionNode(valueData4, {
									selected: true,
								}),
								newCollapsibleSelectionNode(valueData5, {
									selected: true,
								}),
							],
						}),
					],
					parent: root,
				}),
			]);
		});
	});

	describe('filterHierarchy', () => {
		it('should expand tree recursively to any instance of a node which contains filter value and hide all others', () => {
			const root = new HierarchyNode();
			cyclicalDataManagerPlugin.callback(undefined, root, HierarchySelectEventType.LOAD);

			cyclicalDataManagerPlugin.filterHierarchy({
				field: 'name',
				value: 'node4',
			});

			expect(root.children).toEqual([
				newCollapsibleSelectionNode(valueData1, {
					open: true,
					children: [
						newCollapsibleSelectionNode(valueData2, {
							open: true,
							children: [
								newCollapsibleSelectionNode(valueData3, {
									open: true,
									children: [
										newCollapsibleSelectionNode(valueData4),
										newCollapsibleSelectionNode(valueData5, {
											hidden: true,
										}),
									],
								}),
								newCollapsibleSelectionNode(valueData4),
							],
						}),
						newCollapsibleSelectionNode(valueData3, {
							open: true,
							children: [
								newCollapsibleSelectionNode(valueData4),
								newCollapsibleSelectionNode(valueData5, {
									hidden: true,
								}),
							],
						}),
					],
					parent: root,
				}),
			]);
		});

		it('should collapse tree to initial state if search criteria has no value', () => {
			const root = new HierarchyNode();
			cyclicalDataManagerPlugin.callback(undefined, root, HierarchySelectEventType.LOAD);

			cyclicalDataManagerPlugin.filterHierarchy({
				field: 'name',
				value: 'node6',
			});
			cyclicalDataManagerPlugin.filterHierarchy({
				field: 'name',
				value: '',
			});

			expect(root.children).toEqual([newCollapsibleSelectionNode(valueData1, { parent: root })]);
		});
	});
});
