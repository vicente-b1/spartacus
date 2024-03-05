/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CollapsibleNode } from '../collapsible-node.model';
import { CollapsibleSelectAllNode } from '../collapsible-select-all-node.model';
import { CustomBehaviorPlugin } from '..';
import { HierarchyNode } from '../hierarchy-node.model';
import { HierarchySelectEventType } from '../hierarchy-select/hierarchy-select-event.enum';
import { SelectionNode } from '../selection-node.model';
import { CollapseSiblingsOnOpen, Disable1stLevelOnSelection, HierarchySelectLimit, SelectAllChildren, SelectOnAllChildrenSelected } from './hierarchy-select-plugins';

describe('HierarchySelect plugin', () => {
	let plugin: CustomBehaviorPlugin;

	describe('CollapseSiblingsOnOpen', () => {
		let collapsibleNodes: Array<CollapsibleNode>;
		let node: HierarchyNode;

		beforeEach(() => {
			plugin = new CollapseSiblingsOnOpen();

			collapsibleNodes = [new CollapsibleNode(), new CollapsibleNode(), new CollapsibleNode()];
			node = new HierarchyNode('', {
				value: '',
				children: collapsibleNodes,
			});
		});

		it('should collapse all child nodes except for the provided node', () => {
			collapsibleNodes.forEach(collapsibleNode => (collapsibleNode.open = true));

			plugin.callback(collapsibleNodes[1], null, HierarchySelectEventType.COLLAPSE);

			const [childNodeA, childNodeB, childNodeC] = collapsibleNodes;

			expect(childNodeA.open).toBe(false);
			expect(childNodeB.open).toBe(true);
			expect(childNodeC.open).toBe(false);
		});
	});

	describe('Disable1stLevelOnSelection', () => {
		let nodes: Array<HierarchyNode>;
		let rootNode: HierarchyNode;
		let watchedSelectionNode: SelectionNode;

		beforeEach(() => {
			plugin = new Disable1stLevelOnSelection();

			watchedSelectionNode = new SelectionNode();
			nodes = [
				new HierarchyNode('', {
					value: '',
					children: [new SelectionNode(), new SelectionNode(), watchedSelectionNode],
				}),
				new HierarchyNode('', {
					value: '',
					children: [new SelectionNode(), new SelectionNode()],
				}),
				new HierarchyNode('', {
					value: '',
					children: [new SelectionNode(), new SelectionNode()],
				}),
			];
			rootNode = new HierarchyNode('', { value: '', children: nodes });

			nodes.forEach(node => {
				node.children.forEach(selectionNode => {
					(selectionNode as SelectionNode).disabled = false;
					(selectionNode as SelectionNode).selected = false;
				});
			});
		});

		it('should enable nodes who have at least one selection node selected', () => {
			watchedSelectionNode.selected = true;

			// the first argument does not matter
			plugin.callback(null, rootNode, HierarchySelectEventType.SELECT);

			expect(nodes[0].disabled).toBe(false);
		});

		it('should disable nodes who are on equal levels of a node with a selected node', () => {
			watchedSelectionNode.selected = true;

			// the first argument does not matter
			plugin.callback(null, rootNode, HierarchySelectEventType.SELECT);

			expect(nodes[1].disabled).toBe(true);
			expect(nodes[2].disabled).toBe(true);
		});

		it('should enable all nodes if no node has a selected node', () => {
			watchedSelectionNode.selected = false;

			// the first argument does not matter
			plugin.callback(null, rootNode, HierarchySelectEventType.SELECT);

			expect(nodes[0].disabled).toBe(false);
			expect(nodes[1].disabled).toBe(false);
			expect(nodes[2].disabled).toBe(false);
		});
	});

	describe('HierarchySelectLimit', () => {
		let nodes: Array<HierarchyNode>;
		let rootNode: HierarchyNode;
		let hierarchySelectLimit: HierarchySelectLimit;

		let node1: SelectionNode;
		let node2: SelectionNode;
		let node3: SelectionNode;
		let node4: SelectionNode;
		let node5: SelectionNode;
		let node6: SelectionNode;
		let node7: SelectionNode;
		let node8: SelectionNode;
		let node9: SelectionNode;

		beforeEach(() => {
			hierarchySelectLimit = new HierarchySelectLimit(5);
			node1 = new SelectionNode('node1', {
				selected: false,
				disabled: false,
			});
			node2 = new SelectionNode('node2', {
				selected: false,
				disabled: false,
			});
			node3 = new SelectionNode('node3', {
				selected: false,
				disabled: false,
			});
			node4 = new SelectionNode('node4', {
				selected: false,
				disabled: false,
			});
			node5 = new SelectionNode('node5', {
				selected: false,
				disabled: false,
			});
			node6 = new SelectionNode('node6', {
				selected: false,
				disabled: false,
			});
			node7 = new SelectionNode('node7', {
				selected: false,
				disabled: false,
			});
			node8 = new SelectionNode('node8', {
				selected: false,
				disabled: false,
			});
			node9 = new SelectionNode('node9', {
				selected: false,
				disabled: false,
			});
			nodes = [node1, node2, node3, node4, node5, node6, node7, node8, node9];
			rootNode = new HierarchyNode('Root', {
				value: '',
				children: nodes,
			});
		});

		it('should allow selection of up to 5 nodes, all others should be disabled', () => {
			node1.selected = true;
			node2.selected = true;
			node3.selected = true;
			node4.selected = true;
			hierarchySelectLimit.callback(node4, rootNode, HierarchySelectEventType.SELECT);

			expect([node1.selected, node1.disabled]).toEqual([true, false]);
			expect([node2.selected, node2.disabled]).toEqual([true, false]);
			expect([node3.selected, node3.disabled]).toEqual([true, false]);
			expect([node4.selected, node4.disabled]).toEqual([true, false]);
			expect([node5.selected, node5.disabled]).toEqual([false, false]);
			expect([node6.selected, node6.disabled]).toEqual([false, false]);
			expect([node7.selected, node7.disabled]).toEqual([false, false]);
			expect([node8.selected, node8.disabled]).toEqual([false, false]);
			expect([node9.selected, node9.disabled]).toEqual([false, false]);
			expect(hierarchySelectLimit.getLimitExceeded()).toBe(false);

			node5.selected = true;
			hierarchySelectLimit.callback(node5, rootNode, HierarchySelectEventType.SELECT);

			expect([node1.selected, node1.disabled]).toEqual([true, false]);
			expect([node2.selected, node2.disabled]).toEqual([true, false]);
			expect([node3.selected, node3.disabled]).toEqual([true, false]);
			expect([node4.selected, node4.disabled]).toEqual([true, false]);
			expect([node5.selected, node5.disabled]).toEqual([true, false]);
			expect([node6.selected, node6.disabled]).toEqual([false, true]);
			expect([node7.selected, node7.disabled]).toEqual([false, true]);
			expect([node8.selected, node8.disabled]).toEqual([false, true]);
			expect([node9.selected, node9.disabled]).toEqual([false, true]);
			expect(hierarchySelectLimit.getLimitExceeded()).toBe(true);
		});

		it('should re-enable nodes if selections go below 5', () => {
			node1.selected = true;
			node2.selected = true;
			node3.selected = true;
			node4.selected = true;
			node5.selected = true;
			hierarchySelectLimit.callback(node4, rootNode, HierarchySelectEventType.SELECT);
			node1.selected = false;
			hierarchySelectLimit.callback(node1, rootNode, HierarchySelectEventType.SELECT);

			expect([node1.selected, node1.disabled]).toEqual([false, false]);
			expect([node2.selected, node2.disabled]).toEqual([true, false]);
			expect([node3.selected, node3.disabled]).toEqual([true, false]);
			expect([node4.selected, node4.disabled]).toEqual([true, false]);
			expect([node5.selected, node5.disabled]).toEqual([true, false]);
			expect([node6.selected, node6.disabled]).toEqual([false, false]);
			expect([node7.selected, node7.disabled]).toEqual([false, false]);
			expect([node8.selected, node8.disabled]).toEqual([false, false]);
			expect([node9.selected, node9.disabled]).toEqual([false, false]);
			expect(hierarchySelectLimit.getLimitExceeded()).toBe(false);
		});
	});

	describe('SelectAllChildren', () => {
		const root = new HierarchyNode('root', {
			children: [
				new CollapsibleSelectAllNode('selectAll', {
					selected: false,
					children: [
						new SelectionNode('selectionA', { selected: false }),
						new SelectionNode('selectionB', { selected: false }),
						new SelectionNode('selectionC', { selected: false }),
					],
				}),
			],
		});

		const selectAllNode = root.children[0] as CollapsibleSelectAllNode;

		beforeEach(() => {
			plugin = new SelectAllChildren();
		});

		describe('when select all node is selected', () => {
			it('should select all children', () => {
				selectAllNode.selected = true;

				plugin.callback(selectAllNode, root, HierarchySelectEventType.SELECT);

				const [selectionA, selectionB, selectionC] = selectAllNode.children as Array<SelectionNode>;

				expect(selectionA.selected).toBeTruthy();
				expect(selectionB.selected).toBeTruthy();
				expect(selectionC.selected).toBeTruthy();
			});
		});

		describe('when select all node is deselected', () => {
			it('should deselect all children', () => {
				selectAllNode.selected = false;

				plugin.callback(selectAllNode, root, HierarchySelectEventType.SELECT);

				const [selectionA, selectionB, selectionC] = selectAllNode.children as Array<SelectionNode>;

				expect(selectionA.selected).toBeFalsy();
				expect(selectionB.selected).toBeFalsy();
				expect(selectionC.selected).toBeFalsy();
			});
		});
	});

	describe('SelectOnAllChildrenSelected', () => {
		const root = new HierarchyNode('root', {
			children: [
				new CollapsibleSelectAllNode('selectAll', {
					selected: false,
					children: [
						new SelectionNode('selectionA', { selected: false }),
						new SelectionNode('selectionB', { selected: false }),
						new SelectionNode('selectionC', { selected: false }),
					],
				}),
			],
		});
		const selectAllNode = root.children[0] as CollapsibleSelectAllNode;

		beforeEach(() => {
			plugin = new SelectOnAllChildrenSelected();
		});

		describe('when all children is selected', () => {
			it('should select select all node', () => {
				selectAllNode.children.forEach((child: SelectionNode) => (child.selected = true));

				plugin.callback(selectAllNode.children[0], root, HierarchySelectEventType.SELECT);

				expect(selectAllNode.selected).toBeTruthy();
			});
		});

		describe('when not all children is selected', () => {
			it('should deselect select all node', () => {
				selectAllNode.children.forEach((child: SelectionNode) => (child.selected = true));
				const firstNode = selectAllNode.children[0] as SelectionNode;
				firstNode.selected = false;

				plugin.callback(selectAllNode.children[0], root, HierarchySelectEventType.SELECT);

				expect(selectAllNode.selected).toBeFalsy();
			});
		});
	});
});
