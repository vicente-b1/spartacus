/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CollapsibleSelectAllNode } from '../collapsible-select-all-node.model';
import { CustomBehaviorPlugin } from '../custom-behavior-plugin.interface';
import { HierarchyNode } from '../hierarchy-node.model';
import { HierarchySelectEventType } from '../hierarchy-select/hierarchy-select-event.enum';
import { SelectionNode } from '../selection-node.model';

/**
 * Custom behavior plugin for HierarchySelectComponent.
 * On a CollapsibleSelectAllNode select event, select all its descendants
 */
export class SelectAllDescendants implements CustomBehaviorPlugin {
	callback(node: HierarchyNode, root: HierarchyNode, type: HierarchySelectEventType): void {
		if (node instanceof CollapsibleSelectAllNode && type === HierarchySelectEventType.SELECT) {
			for (const child of node.children) {
				this.selectDescendants(child, node);
			}
		}
	}

	private selectDescendants(node: HierarchyNode, parent: HierarchyNode): void {
		if (node instanceof SelectionNode) {
			if (parent instanceof SelectionNode) {
				node.selected = parent.selected;
			}
		}

		if (node.children) {
			for (const child of node.children) {
				this.selectDescendants(child, node);
			}
		}
	}
}
