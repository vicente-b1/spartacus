/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CollapsibleNode } from '../collapsible-node.model';
import { NodeEvent, NodeEventType } from './base';

export interface AddAll<T> extends NodeEvent {
	node: CollapsibleNode<T>;
	type: NodeEventType.ADD_ALL;
}
