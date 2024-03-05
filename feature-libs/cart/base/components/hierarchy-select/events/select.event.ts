/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { HierarchyNode } from '../hierarchy-node.model';
import { NodeEvent, NodeEventType } from './base';

export interface Select<T> extends NodeEvent {
	nodes: Array<{ node: HierarchyNode<T>; selected: boolean }>;
	type: NodeEventType.SELECT;
}
