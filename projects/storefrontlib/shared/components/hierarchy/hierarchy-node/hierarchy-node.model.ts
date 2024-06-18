/**
 * 2024 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { TemplateRef, Type } from '@angular/core';

/**
 * Basic node in a Hierarchy Select tree
 */
export class HierarchyNode<T = any, F = any> {
  children: Array<HierarchyNode> = [];
  disabled = false;
  hidden = false;
  value?: Value;
  parent?: HierarchyNode;
  contentTemplate?: Type<F> | TemplateRef<HierarchyNode<T>>;

  constructor(
    public name = '',
    {
      children = [],
      disabled = false,
      hidden = false,
      value,
      parent,
      contentTemplate,
    }: Partial<HierarchyNode<T>> = defaultHierarchyNodeArgs
  ) {
    this.children = children;
    this.disabled = disabled;
    this.hidden = hidden;
    this.value = value;
    this.parent = parent;
    this.contentTemplate = contentTemplate;

    this.children.forEach((child) => {
      child.parent = this;
    });
  }
}

export const defaultHierarchyNodeArgs: Partial<HierarchyNode> = {
  children: [],
  disabled: false,
  hidden: false,
};

// Define a specific type for value to ensure it has entryGroupNumber and entries properties
export interface Value {
  entryGroupNumber?: number;
  entries?: any[];
};
