/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { TemplateRef, Type } from '@angular/core';

/**
 * Basic node in a Hierarchy Select tree
 */
export class HierarchyNode<T = any, F = any> {
	children: Array<HierarchyNode> = [];
	disabled = false;
	/** Unique dropzone relative to this node's parent's children. */
	dropzone = '';
	tooltip = '';
	hidden = false;
	required = false;
	value?: T;
	parent?: HierarchyNode;
 	// contentTemplate?: Type<F> | TemplateRef<{ $implicit: TemplateContext }>;
	contentTemplate?: Type<F> | TemplateRef<HierarchyNode<T>>;

	constructor(
		public name = '',
		{
			children = [],
			disabled = false,
			dropzone = '',
			tooltip = '',
			hidden = false,
			required = false,
			value,
			parent,
			contentTemplate,
		}: Partial<HierarchyNode<T>> = defaultHierarchyNodeArgs
	) {
		this.children = children;
		this.disabled = disabled;
		this.dropzone = dropzone;
		this.tooltip = tooltip;
		this.hidden = hidden;
		this.required = required;
		this.value = value;
		this.parent = parent;
		this.contentTemplate = contentTemplate;

		this.children.forEach(child => {
			child.parent = this;
		});
	}
}

export const defaultHierarchyNodeArgs: Partial<HierarchyNode> = {
	children: [],
	disabled: false,
	dropzone: '',
	tooltip: '',
	hidden: false,
	required: false,
};
