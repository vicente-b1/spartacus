/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CollapsibleNode } from '../collapsible-node.model';
import { CollapsibleSelectAllNode } from '../collapsible-select-all-node.model';
import { CollapsibleSelectionNode } from '../collapsible-selection-node.model';
import { CustomBehaviorPlugin } from '..';
import { HierarchyNode } from '../hierarchy-node.model';
import { HierarchySelectEventType } from '../hierarchy-select/hierarchy-select-event.enum';
import { SelectionNode } from '../selection-node.model';
import { getSelectedNodes, hasSelectedChild } from '../hierarchy-select.utils';

/**
 * Custom behavior plugin for HierarchySelectComponent.
 * On a Collapse node event, collapses all siblings
 */
export class CollapseSiblingsOnOpen implements CustomBehaviorPlugin {
	callback(node: HierarchyNode, _root: HierarchyNode, type: HierarchySelectEventType): void {
		if (type === HierarchySelectEventType.COLLAPSE) {
			// collapse siblings
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			node.parent!.children
				.filter(child => child instanceof CollapsibleNode || child instanceof CollapsibleSelectionNode)
				.forEach((child) => {;
					if (child !== node) {
						(<CollapsibleNode>child).open = false;
					}
				});
		}
	}
}

/**
 * Custom behavior plugin for HierarchySelectComponent.
 * On a Selection node event, disables all 1st level nodes if they do not have a self or decendent selection.
 */
export class Disable1stLevelOnSelection implements CustomBehaviorPlugin {
	callback(_node: HierarchyNode, root: HierarchyNode, type: HierarchySelectEventType): void {
		if (type === HierarchySelectEventType.SELECT) {
			const firstLevel = root.children;
			// find selections in 1st level
			const hasSelections = [];
			const noSelections = [];
			firstLevel.forEach(child => {
				if (hasSelectedChild(child)) {
					hasSelections.push(child);
				} else {
					noSelections.push(child);
				}
			});

			if (hasSelections.length > 0) {
				// enable ones with selections
				hasSelections.forEach(child => {
					child.disabled = false;
				});
				// disable ones without selections
				noSelections.forEach(child => {
					child.disabled = true;
				});
			} else {
				// enable all
				firstLevel.forEach(child => {
					child.disabled = false;
				});
			}
		}
	}
}

/**
 * Custom behavior plugin for HierarchySelectComponent. On a Selection node event,
 * disables all unselected nodes if more than or equal to the limit are selected.
 */
export class HierarchySelectLimit implements CustomBehaviorPlugin {
	public static defaultLimit = 255;

	private limitExceeded = false;

	constructor(public limit: number = HierarchySelectLimit.defaultLimit) {
		this.limit = limit;
	}

	callback(_node: HierarchyNode, root: HierarchyNode, type: HierarchySelectEventType): void {
		if (type === HierarchySelectEventType.SELECT || type === HierarchySelectEventType.LOAD) {
			const selectedNodes = getSelectedNodes(root).length;
			this.limitExceeded = selectedNodes >= this.limit;
			this.disableDescendants(root.children, this.limitExceeded);
		}
	}

	getLimitExceeded(): boolean {
		return this.limitExceeded;
	}

	private disableDescendants(nodes: Array<HierarchyNode>, toDisable: boolean): void {
		nodes.forEach(node => {
			if ((node instanceof SelectionNode || node instanceof CollapsibleSelectionNode) && node.selected) {
				node.disabled = false;
			} else {
				node.disabled = toDisable;
			}
			this.disableDescendants(node.children, toDisable);
		});
	}
}

/**
 * Custom behavior plugin for HierarchySelectComponent.
 * On a Selection node event, deselect previously selected node.
 */
export class SingleSelectionOnly implements CustomBehaviorPlugin {
	callback(node: HierarchyNode, root: HierarchyNode, type: HierarchySelectEventType): void {
		if (type === HierarchySelectEventType.SELECT) {
			this.deselectNode(node, root);
		}
	}

	private deselectNode(selectedNode: HierarchyNode, root: HierarchyNode): void {
		if (root.value !== selectedNode.value && (root instanceof SelectionNode || root instanceof CollapsibleSelectionNode)) {
			root.selected = false;
		}

		for (const child of root.children) {
			this.deselectNode(selectedNode, child);
		}
	}
}

/**
 * Custom behavior plugin for HierarchySelectComponent.
 * On a CollapsibleSelectAllNode select event, select all its SeletionNode children
 */
export class SelectAllChildren implements CustomBehaviorPlugin {
	callback(node: CollapsibleSelectAllNode, _root: HierarchyNode, type: HierarchySelectEventType): void {
		if (node instanceof CollapsibleSelectAllNode && type === HierarchySelectEventType.SELECT) {
			node.children
				.filter(child => child instanceof SelectionNode)
				.forEach((child) => {
					(<SelectionNode>child).selected = node.selected;
				});
		}
	}
}

/**
 * Custom behavior plugin for HierarchySelectComponent.
 * On a SelectionNode select event, select/deselect parent CollapsibleSelectAllNode based on selected status of all children
 */
export class SelectOnAllChildrenSelected implements CustomBehaviorPlugin {
	callback(node: SelectionNode, _root: HierarchyNode, type: HierarchySelectEventType): void {
		if (node instanceof SelectionNode && node.parent instanceof CollapsibleSelectAllNode && type === HierarchySelectEventType.SELECT) {
			const isAllChildrenSelected = node.parent.children.every((child) => (<SelectionNode>child).selected);
			const parent = node.parent as CollapsibleSelectAllNode;
			parent.selected = isAllChildrenSelected;
		}
	}
}
