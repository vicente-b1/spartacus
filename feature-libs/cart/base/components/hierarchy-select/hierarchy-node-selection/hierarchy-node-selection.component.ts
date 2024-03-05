/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component, OnInit } from '@angular/core';

import { NodeEventType, Select } from '../events';
import { HierarchyNodeComponent } from '../hierarchy-node/hierarchy-node.component';
import { SelectionNode } from '../selection-node.model';
import { HierarchySearchCriteria, SelectionEvent, SelectionEventType } from './hierarchy-node-selection.model';
import { HierarchyNodeSelectionService } from './hierarchy-node-selection.service';

/**
 * Hierarchy Selection node variant to show a toggleable checkbox
 */
@Component({
	selector: 'cx-hierarchy-selection',
	template: `
		<div
			class="cx-hierarchy-node selection"
			[style.padding-left.px]="paddingPrefix"
			[class.hidden]="isHidden || tree.hidden"
			[title]="tree.tooltip"
			matTooltipPosition="right"
			matTooltipShowDelay="1200"
		>
			<mat-checkbox [(ngModel)]="selected" [disabled]="tree.disabled" labelPosition="before">
				<span *ngIf="requireRequired && tree.required" class="asterisk">* </span>
				<span *renderContent="tree.contentTemplate; context: tree; token: HIERARCHY_NODE">
					{{ tree.name }}
				</span>
			</mat-checkbox>
		</div>
		<cx-hierarchy-node
			*ngFor="let child of tree.children; let i = index"
			[tree]="child"
			[paddingPrefix]="childPaddingLeft"
			[requireRequired]="requireRequired"
			(collapsibleToggle)="collapsibleToggle.emit($event)"
			(selectionToggle)="selectionToggle.emit($event)"
		></cx-hierarchy-node>
	`,
	styleUrls: ['../hierarchy-node/hierarchy-node.component.scss', './hierarchy-node-selection.component.scss'],
})
export class HierarchyNodeSelectionComponent<T> extends HierarchyNodeComponent<T> implements OnInit {
	tree: SelectionNode;

	isHidden = false;

	constructor(private hierarchyNodeSelectionService: HierarchyNodeSelectionService) {
		super();
	}

	/**
	 *  1. make selection node searchable -
	 *     subscribed on event that includes criterion(condition)
	 *     to change whether this selection node should be displayed or not
	 *  2. make selection node notifiable from seletion event outside -
	 *     subscribed on event that includes selection event detail to change
	 *     the node selected status
	 *  NOTE: 1. both subscriptions are by default turned off;
	 *  	  2. for the current requirement, both events are ONLY available to selection node
	 *  	  	 could expand that to all node types if the requirements are more specified
	 */
	ngOnInit(): void {
		if (this.tree.searchable) {
			this.hierarchyNodeSelectionService.search.subscribe((criteria: HierarchySearchCriteria) => {
				this.isHidden = !this.tree.value[criteria.field].toLowerCase().includes(criteria.value);
			});
		}

		if (this.tree.notifySelection) {
			this.hierarchyNodeSelectionService.select.subscribe((selectionEvent: SelectionEvent) => {
				if (this.tree.value[selectionEvent.field] === selectionEvent.value) {
					this.tree.selected = selectionEvent.type === SelectionEventType.SELECT;
					this.selectionToggle.emit(this.tree);
				}
			});
		}
	}

	get selected(): boolean {
		return this.tree.selected;
	}

	set selected(newValue: boolean) {
		this.tree.selected = newValue;
		const event: Select<T> = {
			nodes: [
				{
					node: this.tree,
					selected: this.tree.selected,
				},
			],
			type: NodeEventType.SELECT,
		};
		this.event.emit(event);
		this.selectionToggle.emit(this.tree);
	}
}
