/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { SelectionNode, defaultSelectionNodeArgs } from './selection-node.model';

export class CollapsibleSelectAllNode<T = any> extends SelectionNode<T> {
	addAll = false;
	open = false;
	removeAll = false;

	constructor(name = '', { addAll = false, open = false, removeAll = false, ...hierarchyNode }: Partial<CollapsibleSelectAllNode<T>> = defaultCollapsibleSelectAllNodeArgs) {
		super(name, hierarchyNode);
		this.addAll = addAll;
		this.open = open;
	}
}

export const defaultCollapsibleSelectAllNodeArgs: Partial<CollapsibleSelectAllNode> = {
	open: false,
	...defaultSelectionNodeArgs,
};
