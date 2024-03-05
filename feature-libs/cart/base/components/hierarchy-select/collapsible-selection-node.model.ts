/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CollapsibleNode, LazyLoadFactory } from './collapsible-node.model';
import { HierarchyNode, defaultHierarchyNodeArgs } from './hierarchy-node.model';
import { SelectionNode } from './selection-node.model';

/**
 * Collapsible-type node in a Hierarchy Select tree
 */
export class CollapsibleSelectionNode<T = any> extends HierarchyNode<T> implements CollapsibleNode<T>, SelectionNode<T> {
	/** SelectableNode properties */
	selected = false;
	searchable = true;
	notifySelection = true;
	hidden = false;
	/** CollapsibleNode properties */
	addAll = false;
	open = false;
	removeAll = false;
	/** childValues can be used for CollapsibleSelectionNodes before children are loaded to save resources and avoid potential cycles */
	childValues: Array<T> = [];
	/** childValues can be used for CollapsibleSelectionNodes before children are loaded to save resources and avoid potential cycles */
	parentValues: Array<T> = [];
	/** Checkbox label to show if node is selected */
	selectedCheckboxLabel = '';
	/** Checkbox label to show if node is not selected */
	unselectedCheckboxLabel = '';
	/** Determines whether checkbox label is always visible, or only appears on hover */
	showCheckboxLabelOnHover = true;
	/** Determines whether all nodes have checkbox labels, or only those with children */
	showCheckboxLabelIfHasChildren = true;
	/** Use the entire row to select node (instead of checkbox) */
	fullRowSelect = false;
	/** Use the entire row to toggle tree (instead of checkbox) */
	fullRowToggle = false;

	hideSelect: boolean;

	lazyLoadFactory?: LazyLoadFactory<T>;

	dontHideTheExpandCollapseAndBorderForAnyReason: boolean;

	constructor(
		name = '',
		{
			addAll = false,
			open = false,
			removeAll = false,
			selected = false,
			searchable = false,
			hidden = false,
			notifySelection = false,
			childValues = [],
			parentValues = [],
			selectedCheckboxLabel = '',
			unselectedCheckboxLabel = '',
			showCheckboxLabelOnHover = true,
			showCheckboxLabelIfHasChildren = true,
			fullRowSelect = false,
			fullRowToggle = false,
			hideSelect,
			lazyLoadFactory,
			dontHideTheExpandCollapseAndBorderForAnyReason,
			...hierarchyNode
		}: Partial<CollapsibleSelectionNode<T>> = defaultCollapsibleNodeArgs
	) {
		super(name, hierarchyNode);
		this.addAll = addAll;
		this.open = open;
		this.removeAll = removeAll;
		this.selected = selected;
		this.searchable = searchable;
		this.hidden = hidden;
		this.notifySelection = notifySelection;
		this.childValues = childValues;
		this.parentValues = parentValues;
		this.selectedCheckboxLabel = selectedCheckboxLabel;
		this.unselectedCheckboxLabel = unselectedCheckboxLabel;
		this.showCheckboxLabelOnHover = showCheckboxLabelOnHover;
		this.showCheckboxLabelIfHasChildren = showCheckboxLabelIfHasChildren;
		this.fullRowSelect = fullRowSelect;
		this.fullRowToggle = fullRowToggle;
		this.hideSelect = hideSelect;
		this.lazyLoadFactory = lazyLoadFactory;
		this.dontHideTheExpandCollapseAndBorderForAnyReason = dontHideTheExpandCollapseAndBorderForAnyReason;
	}
}

const defaultCollapsibleNodeArgs: Partial<CollapsibleSelectionNode> = {
	open: false,
	selected: false,
	searchable: false,
	hidden: false,
	notifySelection: true,
	childValues: [],
	parentValues: [],
	selectedCheckboxLabel: '',
	unselectedCheckboxLabel: '',
	showCheckboxLabelOnHover: true,
	showCheckboxLabelIfHasChildren: true,
	fullRowSelect: false,
	fullRowToggle: false,
	...defaultHierarchyNodeArgs,
};
