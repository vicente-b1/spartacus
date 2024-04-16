/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { HierarchyNode, defaultHierarchyNodeArgs } from './hierarchy-node.model';

/**
 * Collapsible-type node in a Hierarchy Select tree
 */
export class CollapsibleNode<T = any> extends HierarchyNode<T> {

	addAll = false;
	open = false;
	removeAll = false;

	constructor(name = '', { addAll = false, open = false, removeAll = false, ...hierarchyNode }: Partial<CollapsibleNode<T>> = defaultCollapsibleNodeArgs) {
		super(name, hierarchyNode);
		this.addAll = addAll;
		this.open = open;
		this.removeAll = removeAll;
	}
}

export const defaultCollapsibleNodeArgs: Partial<CollapsibleNode> = {
	open: false,
	...defaultHierarchyNodeArgs,
};
