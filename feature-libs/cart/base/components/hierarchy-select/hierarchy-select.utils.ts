/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

// import { CategoryWithPath } from 'app/bulk-action/entities/product-entity/product-filter/product-filter.component';

import { CollapsibleNode } from './collapsible-node.model';
import { CollapsibleSelectAllNode } from './collapsible-select-all-node.model';
import { CollapsibleSelectionNode } from './collapsible-selection-node.model';
import { HierarchyNode } from './hierarchy-node.model';
import { HierarchySearchCriteria } from './hierarchy-node-selection/hierarchy-node-selection.model';
import { SelectionNode } from './selection-node.model';

/**
 * Depth-first search for finding a selected SelectionNode
 */
export function hasSelectedChild(node: HierarchyNode): boolean {
	if ((node instanceof SelectionNode || node instanceof CollapsibleSelectionNode) && node.selected) {
		return true;
	} else {
		return node.children.find(child => hasSelectedChild(child as SelectionNode)) !== undefined;
	}
}

/**
 * Recursively filter hierarchy by provided criteria.
 */
export function filterHierarchy(rootNode: HierarchyNode, criteria: HierarchySearchCriteria): void {
	if (criteria.value) {
		filterDescendants(rootNode, criteria);
	} else {
		// If criteria is empty it means the user has removed their searchterms. Hierarchy should be reset.
		resetHierarchy(rootNode);
	}
}

/**
 * @returns whether the node is selectable.
 */
export function selectable<T>(node: HierarchyNode<T>): node is SelectionNode<T> {
	return node instanceof SelectionNode || node instanceof CollapsibleSelectionNode;
}

/**
 * Collapse and unhide all nodes recursively.
 */
export function resetHierarchy(node: HierarchyNode<any>): void {
	node.children.forEach(child => {
		if (child instanceof CollapsibleNode || child instanceof CollapsibleSelectionNode) {
			child.open = false;
		}
		child.hidden = false;
		resetHierarchy(child);
	});
}

/**
 * Recursively fetch all selected nodes in hierarchy.
 */
export function getSelectedNodes(node: HierarchyNode, selectedNodes: Array<SelectionNode> = []): Array<SelectionNode> {
	node.children.forEach(child => {
		if ((child instanceof SelectionNode || child instanceof CollapsibleSelectionNode) && !(child instanceof CollapsibleSelectAllNode) && child.selected) {
			selectedNodes.push(child);
		}
		getSelectedNodes(child, selectedNodes);
	});

	return selectedNodes;
}

/**
 * Recursively fetch nodes based on selection function.
 */
export function findNodes(node: HierarchyNode, selector: (node: HierarchyNode) => boolean, foundNodes: Array<HierarchyNode> = []): Array<HierarchyNode> {
	node.children.forEach(child => {
		if (selector(child)) {
			foundNodes.push(child);
		}
		findNodes(child, selector, foundNodes);
	});

	return foundNodes;
}

/**
 * Return true if the value is an object with criteria field which contains criteria value.
 * Return true if the value is a string which contains criteria value.
 * Otherwise, return false.
 */
export function hasMatch(value: any, criteria: HierarchySearchCriteria): boolean {
	const critField = criteria.field;
	const critValue = criteria.value;
	const matchField = typeof value === 'object' && value[critField] && value[critField].toLowerCase().includes(critValue.toLowerCase());
	const matchValue = typeof value === 'string' && value.toLowerCase().includes(critValue.toLowerCase());
	return matchField || matchValue;
}

/**
 * Recursively shows node children which match criteria and their ancestors.
 * Recursively hides node chldren which do not match criteria.
 */
function filterDescendants(node: HierarchyNode, criteria: HierarchySearchCriteria): void {
	node.children.forEach(child => {
		if (hasMatch(child.value, criteria)) {
			child.hidden = false;
			showAncestors(child.parent as HierarchyNode<CategoryWithPath>);
		} else {
			child.hidden = true;
		}
		filterDescendants(child, criteria);
	});
}

/**
 * Recursively shows and expands all ancestors of a node which matches the criteria.
 */
// function showAncestors(node: HierarchyNode<CategoryWithPath>): void {
	function showAncestors(node: HierarchyNode<CategoryWithPath>): void {
	if (node) {
		if (node instanceof CollapsibleNode || node instanceof CollapsibleSelectionNode) {
			node.open = true;
		}
		node.hidden = false;
		showAncestors(node.parent as CollapsibleNode<CategoryWithPath>);
	}
}

export interface CategoryWithPath extends Category {
	path: Array<CategoryPathSegment>;
}

export interface CategoryPathSegment {
    id: string;
    name: string;
}

/**
 * Model returned from CategoryService calls and also used as a template for
 * creating/updating categories
 */
export declare class Category implements CategoryBase {
    id: string;
    name: string;
    description: string;
    active: boolean;
    media: string;
    published: boolean;
    // seo?: SeoCategory;
    /** Will be null if parent IDs were not requested when category was retrieved */
    parentIds?: Array<string>;
    // position?: Big;
    paths?: Array<Array<CategoryPathSegment>>;
    hasActiveSubcategories: boolean;
    hasActiveProducts: boolean;
    // sort?: SortType;
    // filters?: Array<FilterCriteria>;
    // dynamicFilters?: Array<CustomAttributeBase>;
    // type: CategoryType;
    hideProducts?: boolean;
    constructor({ active, description, id, media, name, published, parentIds, paths, hideProducts, }: Partial<Category>);
}

export declare class CategoryBase {
    id?: string;
    name: string;
    description?: string;
    active?: boolean;
    media?: string;
    published?: boolean;
}
