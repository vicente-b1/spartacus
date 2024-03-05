/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { HierarchyNode, defaultHierarchyNodeArgs } from './hierarchy-node.model';

/**
 * Checkbox-selectable node in a Hierarchy Select tree
 */
export class SelectionNode<T = any> extends HierarchyNode<T> {
	selected = false;
	searchable = false;
	notifySelection = false;
	sellingTreeId?: string;

	constructor(
		name = '',
		{ selected = false, searchable = false, notifySelection = false, sellingTreeId, ...hierarchyNode }: Partial<SelectionNode<T>> = defaultSelectionNodeArgs
	) {
		super(name, hierarchyNode);
		this.selected = selected;
		this.searchable = searchable;
		this.notifySelection = notifySelection;
		this.sellingTreeId = sellingTreeId;
	}
}

export const defaultSelectionNodeArgs = {
	selected: false,
	searchable: false,
	notifySelection: false,
	...defaultHierarchyNodeArgs,
};
