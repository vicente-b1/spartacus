/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component } from '@angular/core';
// import { MatCheckboxChange } from '@angular/material/checkbox';
import { CollapsibleSelectAllNode } from '../collapsible-select-all-node.model';
import { HierarchyNodeCollapsibleComponent } from '../hierarchy-node-collapsible/hierarchy-node-collapsible.component';

@Component({
	selector: 'cx-hierarchy-collapsible-select-all',
	template: `
		<div
			class="cx-hierarchy-node collapsible selectAllAble"
			[style.padding-left.px]="paddingPrefix"
			(click)="toggle()"

			[title]="tree.tooltip"
			matTooltipPosition="right"
			matTooltipShowDelay="1200"
		>
			<span class="toggle-and-name">
				<!-- <mat-icon *ngIf="!open">{{ 'slim-arrow-right' | sapIcon }}</mat-icon> -->
				<!-- <mat-icon *ngIf="open">{{ 'slim-arrow-down' | sapIcon }}</mat-icon> -->
				<span *ngIf="!open">>></span>
				<span *ngIf="open">V(down)</span>
				<div class="border"></div>
				<span>{{ tree.name }}</span>
			</span>
			<input [checked]="tree?.selected" [disabled]="tree?.disabled" (change)="onSelectAll($event)" (click)="$event.stopPropagation()" labelPosition="before"
				/>Select all
		</div>
		<cx-hierarchy-node
			*ngFor="let child of tree.children; let i = index"
			[tree]="child"
			[paddingPrefix]="childPaddingLeft"
			[requireRequired]="requireRequired"
			(collapsibleToggle)="collapsibleToggle.emit($event)"
			(selectionToggle)="selectionToggle.emit($event)"
			(event)="event.emit($event)"
		></cx-hierarchy-node>
	`,
	styleUrls: [
		'../hierarchy-node/hierarchy-node.component.scss',
		'../hierarchy-node-collapsible/hierarchy-node-collapsible.component.scss',
		'./hierarchy-node-collapsible-select-all.component.scss',
	],
})
export class HierarchyNodeCollapsibleSelectAllComponent<T> extends HierarchyNodeCollapsibleComponent<T> {
	tree: CollapsibleSelectAllNode;

	onSelectAll(change: any): void {
		this.tree.selected = change.checked;
		this.selectionToggle.emit(this.tree);
	}
}
