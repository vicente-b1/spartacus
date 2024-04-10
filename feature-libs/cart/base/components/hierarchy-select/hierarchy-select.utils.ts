/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
import { CollapsibleNode } from './collapsible-node.model';
import { CollapsibleSelectAllNode } from './collapsible-select-all-node.model';
import { CollapsibleSelectionNode } from './collapsible-selection-node.model';
import { HierarchyNode } from './hierarchy-node.model';
import { SelectionNode } from './selection-node.model';

/**
 * Depth-first search for finding a selected SelectionNode
 */
export function hasSelectedChild(node: HierarchyNode): boolean {
	if ((node instanceof SelectionNode || node instanceof CollapsibleSelectionNode) && node.selected) {
		return true;
	} else {
		return node.children.find(child => hasSelectedChild(child as SelectionNode)) !== undefined;
	}
}

/**
 * @returns whether the node is selectable.
 */
export function selectable<T>(node: HierarchyNode<T>): node is SelectionNode<T> {
	return node instanceof SelectionNode || node instanceof CollapsibleSelectionNode;
}

/**
 * Collapse and unhide all nodes recursively.
 */
export function resetHierarchy(node: HierarchyNode<any>): void {
	node.children.forEach(child => {
		if (child instanceof CollapsibleNode || child instanceof CollapsibleSelectionNode) {
			child.open = false;
		}
		child.hidden = false;
		resetHierarchy(child);
	});
}

/**
 * Recursively fetch all selected nodes in hierarchy.
 */
export function getSelectedNodes(node: HierarchyNode, selectedNodes: Array<SelectionNode> = []): Array<SelectionNode> {
	node.children.forEach(child => {
		if ((child instanceof SelectionNode || child instanceof CollapsibleSelectionNode) && !(child instanceof CollapsibleSelectAllNode) && child.selected) {
			selectedNodes.push(child);
		}
		getSelectedNodes(child, selectedNodes);
	});

	return selectedNodes;
}

/**
 * Recursively fetch nodes based on selection function.
 */
export function findNodes(node: HierarchyNode, selector: (node: HierarchyNode) => boolean, foundNodes: Array<HierarchyNode> = []): Array<HierarchyNode> {
	node.children.forEach(child => {
		if (selector(child)) {
			foundNodes.push(child);
		}
		findNodes(child, selector, foundNodes);
	});

	return foundNodes;
}
