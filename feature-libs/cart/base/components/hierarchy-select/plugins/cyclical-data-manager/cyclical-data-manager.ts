/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CollapsibleSelectionNode } from '../../collapsible-selection-node.model';
import { CustomBehaviorPlugin } from '../../custom-behavior-plugin.interface';
import { HierarchyNode } from '../../hierarchy-node.model';
import { HierarchySearchCriteria } from '../../hierarchy-node-selection/hierarchy-node-selection.model';
import { HierarchySelectEventType } from '../../hierarchy-select/hierarchy-select-event.enum';
import { SelectionNode } from '../../selection-node.model';
import { hasMatch } from '../../hierarchy-select.utils';
import { ValueData } from './value-data.interface';
import { CyclicalDataManagerConfig, NewNodeConfig } from './cyclical-data-manager-config.interface';

/**
 * Custom behavior plugin for HierarchySelectComponent.
 * Plugin designed to enable recursive filter and select safely for data which is cyclical in nature.
 * On select event, selects or deselects node and all descendants recursively.
 * On collapse event, expand node and load all grandchild nodes so children show dropdown arrows.
 * On load event, build first level nodes using provided value data.
 */
export class CyclicalDataManager<T> implements CustomBehaviorPlugin {
	/** All node value data in a given hierarchy. */
	private allValueData: Array<ValueData<T>> = [];

	/** All node value data in first level of hierarchy. */
	private firstLevelValueData: Array<ValueData<T>> = [];

	/** All currently selected values - nodes with these values should always appear as selected. */
	private selectedValues: Array<T> = [];

	/** Determines whether or not selecting a node will also select its descendants. */
	private selectDescendants = true;

	private newNodeConfig: NewNodeConfig;

	private rootNode: HierarchyNode;

	/** Persists all values which match current search. */
	private filterValues: Array<T>;

	constructor({
		allValueData = [],
		firstLevelValueData = [],
		selectedValues = [],
		selectDescendants = true,
		newNodeConfig = {
			selectedCheckboxLabel: 'Deselect all',
			unselectedCheckboxLabel: 'Select all',
		},
	}: Partial<CyclicalDataManagerConfig<T>>) {
		this.allValueData = allValueData;
		this.firstLevelValueData = firstLevelValueData;
		this.selectedValues = selectedValues;
		this.selectDescendants = selectDescendants;
		this.newNodeConfig = newNodeConfig;
	}

	getSelectedValues(): Array<T> {
		return this.selectedValues;
	}

	/**
	 * Callback which supports select, collapse, or load event.
	 */
	callback(node: CollapsibleSelectionNode<T>, root: HierarchyNode, type: HierarchySelectEventType): void {
		if (type === HierarchySelectEventType.SELECT) {
			this.selectValue(
				{
					value: node.value,
					childValues: node.childValues,
					parentValues: node.parentValues,
					name: node.name,
				},
				node.selected
			);
		} else if (type === HierarchySelectEventType.COLLAPSE) {
			if (node.open) {
				node.children = node.childValues.map(childValue => {
					const childValueData = this.getValueData(childValue);
					const childNode = this.newCollapsibleSelectionNode(childValueData, node);
					return childNode;
				});
			}
		} else if (type === HierarchySelectEventType.LOAD) {
			root.children = this.firstLevelValueData.map(valueData => {
				const newNode = this.newCollapsibleSelectionNode(valueData, root);
				return newNode;
			});
			this.rootNode = root;
		}
	}

	/**
	 * Filter hierarchy by provided criteria.
	 */
	filterHierarchy(criteria: HierarchySearchCriteria): void {
		if (criteria.value) {
			const matches: Array<T> = [];
			const ancestors: Array<T> = [];
			this.allValueData.forEach(valueData => {
				if (hasMatch(valueData.value, criteria)) {
					matches.push(valueData.value);
					ancestors.push(...this.getAncestors(valueData.parentValues));
				}
			});

			this.filterValues = Array.from(new Set([...matches, ...ancestors]));
			this.filterNodes(matches, ancestors, this.rootNode);
		} else {
			// If criteria is empty it means the user has removed their searchterms. Hierarchy should be reset.
			this.resetHierarchy();
		}
	}

	/**
	 * Show all nodes with value in matches
	 * Collapse all other nodes.
	 */
	private filterNodes(matches: Array<T>, ancestors: Array<T>, node: HierarchyNode, traversedValues: Array<T> = []): void {
		node.children.forEach((childNode: CollapsibleSelectionNode) => {
			const valueIsAncestor = ancestors.includes(childNode.value);
			const valueIsMatch = matches.includes(childNode.value);
			const valueIsTraversed = traversedValues.includes(childNode.value);
			childNode.hidden = !valueIsAncestor && !valueIsMatch;
			childNode.open = valueIsAncestor && !valueIsTraversed;
			if (valueIsAncestor && !valueIsTraversed) {
				childNode.children = this.getChildNodes(childNode);
				const newTraversedValues = [...traversedValues, childNode.value];
				this.filterNodes(matches, ancestors, childNode, newTraversedValues);
			}
		});
	}

	/**
	 * Recursively build array of ancestors for provided parent values.
	 */
	private getAncestors(parentValues: Array<T>, ancestorValues: Array<T> = []): Array<T> {
		if (parentValues) {
			parentValues.forEach(parentValue => {
				const parentValueData = this.getValueData(parentValue);
				if (parentValueData && !ancestorValues.includes(parentValue)) {
					ancestorValues.push(parentValue);
					this.getAncestors(parentValueData.parentValues, ancestorValues);
				}
			});
		}

		return ancestorValues;
	}

	/**
	 * Reset hierarchy and clear filterValues.
	 */
	private resetHierarchy(): void {
		this.rootNode.children.forEach((child: CollapsibleSelectionNode) => {
			child.hidden = false;
			child.open = false;
			child.children = [];
		});
		delete this.filterValues;
	}

	/**
	 * Adds or removes valueData value to selectedValues array.
	 * Adds all descendants as well if selectDescendants is true.
	 * Updates all hierarchy nodes to show latest selections.
	 */
	private selectValue(valueData: ValueData<T>, toSelect: boolean): void {
		const selectNodeDescendants = (childValueData: ValueData<T>, childSelect: boolean): void => {
			if (this.selectDescendants) {
				childValueData.childValues.forEach(childValue => {
					this.selectValue(this.getValueData(childValue), childSelect);
				});
			}
		};

		if (toSelect && !this.selectedValues.includes(valueData.value)) {
			// If toSelect is true and node's value is not selected, add to selectedValues.
			this.selectedValues = this.selectedValues.concat(valueData.value);
			selectNodeDescendants(valueData, toSelect);
		} else if (!toSelect && this.selectedValues.includes(valueData.value)) {
			// If toSelect is false and node's value is selected, remove from selectedValues.
			this.selectedValues = this.selectedValues.filter(iterValue => iterValue !== valueData.value);
			selectNodeDescendants(valueData, toSelect);
		}
		this.synchonizeSelectedNodes(this.rootNode);
	}

	/**
	 * Creates CollapsibleSelectionNode from provided valueData.
	 * Sets selected property based on current contents of selectedValues array.
	 * Sets hidden property based on current contents of filterValues array.
	 */
	private newCollapsibleSelectionNode(valueData: ValueData<T>, parent: HierarchyNode): CollapsibleSelectionNode<T> {
		const selected = this.selectedValues.includes(valueData.value);
		return new CollapsibleSelectionNode<T>(valueData.name, {
			value: valueData.value,
			selected,
			hidden: this.filterValues && !this.filterValues.includes(valueData.value),
			childValues: valueData.childValues,
			parentValues: valueData.parentValues,
			parent,
			...this.newNodeConfig,
		});
	}

	/**
	 * Create array of nodes from childValues of provided node.
	 */
	private getChildNodes(node: CollapsibleSelectionNode): Array<CollapsibleSelectionNode> {
		const childNodes: Array<CollapsibleSelectionNode> = [];
		const childValueData = this.allValueData.filter(iterValueData => node.childValues.includes(iterValueData.value));
		childValueData.forEach(childData => {
			childNodes.push(this.newCollapsibleSelectionNode(childData, node));
		});
		return childNodes;
	}

	/**
	 * Gets valueData object corresponding to specific value.
	 */
	private getValueData(value: T): ValueData<T> {
		return this.allValueData.find(valueData => valueData.value === value);
	}

	/**
	 * Recursively set all nodes in hierarchy as selected if their values are found in selectedValues.
	 */
	private synchonizeSelectedNodes(node: HierarchyNode): void {
		node.children.forEach((childNode: SelectionNode<T>) => {
			childNode.selected = this.selectedValues.includes(childNode.value);
			this.synchonizeSelectedNodes(childNode);
		});
	}
}
