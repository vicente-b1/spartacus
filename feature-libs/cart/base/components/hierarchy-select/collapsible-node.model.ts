/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Observable } from 'rxjs';

import { HierarchyNode, defaultHierarchyNodeArgs } from './hierarchy-node.model';

export type LazyLoadFactory<T> = (this: void, value: CollapsibleNode<T>) => Observable<Array<HierarchyNode>>;

/**
 * Collapsible-type node in a Hierarchy Select tree
 */
export class CollapsibleNode<T = any> extends HierarchyNode<T> {
	/**
	 * Factory function to create a stream that will update the node's children.
	 *   To save space on the browser, declare only one function that uses the first argument
	 *   to generate the stream - the stream will only be created when the node absolutely needs to render its children.
	 * If "children" is provided, this will not be called.
	 */
	lazyLoadFactory?: LazyLoadFactory<T>;

	addAll = false;
	open = false;
	removeAll = false;

	constructor(name = '', { addAll = false, open = false, removeAll = false, lazyLoadFactory, ...hierarchyNode }: Partial<CollapsibleNode<T>> = defaultCollapsibleNodeArgs) {
		super(name, hierarchyNode);
		this.addAll = addAll;
		this.open = open;
		this.removeAll = removeAll;
		this.lazyLoadFactory = lazyLoadFactory;
	}
}

export const defaultCollapsibleNodeArgs: Partial<CollapsibleNode> = {
	open: false,
	...defaultHierarchyNodeArgs,
};
