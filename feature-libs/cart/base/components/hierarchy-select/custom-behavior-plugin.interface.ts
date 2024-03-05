/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { HierarchyNode } from './hierarchy-node.model';
import { HierarchySelectEventType } from './hierarchy-select/hierarchy-select-event.enum';

/**
 * Custom behavior plugin for Hierarchy Select component
 */
export interface CustomBehaviorPlugin {
	/**
	 * Method that is run on event
	 * Note: `this` will be the plugin itself to access internal state and methods
	 */
	callback(node: HierarchyNode, root: HierarchyNode, type: HierarchySelectEventType): void;
}
