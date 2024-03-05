/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { HierarchyNode } from '../hierarchy-node.model';
import { NodeEvent, NodeEventType } from './base';

export interface LoadChildren<T> extends NodeEvent {
	node: HierarchyNode<T>;
	children: Array<HierarchyNode>;
	type: NodeEventType.LOAD_CHILDREN;
}
