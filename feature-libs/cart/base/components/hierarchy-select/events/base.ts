/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

export enum NodeEventType {
	NONE,
	ADD_ALL,
	LOAD_CHILDREN,
	REMOVE_ALL,
	SELECT,
}

/**
 * Basic interface for a node's specific events, besides collapsing and selecting (for now).
 */
export interface NodeEvent {
	type: NodeEventType;
}
