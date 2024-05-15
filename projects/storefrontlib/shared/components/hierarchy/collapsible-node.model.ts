/**
 * 2024 SAP SE or an SAP affiliate company. All rights reserved.
 */

import {
  HierarchyNode,
  defaultHierarchyNodeArgs,
} from './hierarchy-node.model';

/**
 * Collapsible-type node in a Hierarchy Select tree
 */
export class CollapsibleNode<T = any> extends HierarchyNode<T> {
  open = false;

  constructor(
    name = '',
    {
      open = false,
      ...hierarchyNode
    }: Partial<CollapsibleNode<T>> = defaultCollapsibleNodeArgs
  ) {
    super(name, hierarchyNode);
    this.open = open;
  }
}

export const defaultCollapsibleNodeArgs: Partial<CollapsibleNode> = {
  open: false,
  ...defaultHierarchyNodeArgs,
};
