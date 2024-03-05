/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { CollapsibleNode } from '../index';
import { CollapsibleSelectAllNode } from '../index';
import { CollapsibleSelectionNode } from '../index';
import { NodeEvent } from '../events';
import { HierarchyNode } from '../hierarchy-node.model';
import { HIERARCHY_NODE } from '../hierarchy-node.token';
import { SelectionNode } from '../selection-node.model';
import { TitleNode } from '../title-node.model';

/**
 * Hierarchy Selection node wrapper that handles unkown nodes or delegates to variant nodes.
 *
 * __Implementing New Variant Node__
 * 1. Create a new subclass of `HierarchyNode`
 * 2. Create a new subclass of `HierarchyNodeComponent` to display your node.
 * 2. a. Naming convention for selector is "cx-hierarchy-<variant>"
 * 2. b. Remember that basic styles are available in _hierarchy-node.component.scss_
 * 2. c. If creating a new event, add it to `HierarchyNodeComponent` as all nodes will need to bubble this event up.
 * 3. Add the new type assignment to `setType()`
 * 4. Create a case in the template for `HierarchyNodeComponent`
 * 4. a. Remember to bubble up all events that need to reach the HierarchySelectComponent
 */
@Component({
	selector: 'cx-hierarchy-node',
	template: `
		<div>
			<ng-container *ngIf="type === 'NODE'">
				<div
					class="cx-hierarchy-node"
					[style.padding-left.px]="paddingPrefix"
					[title]="tree.tooltip"
					matTooltipPosition="right"
					matTooltipShowDelay="1200"
				>
					<span *renderContent="tree.contentTemplate; context: tree; token: HIERARCHY_NODE">
						{{ tree.name }}
					</span>
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
			</ng-container>
			<ng-container *ngIf="type === 'TITLE'">
				<cx-hierarchy-title
					[tree]="tree"
					[paddingPrefix]="childPaddingLeft - childPadding"
					[requireRequired]="requireRequired"
					(collapsibleToggle)="collapsibleToggle.emit($event)"
					(selectionToggle)="selectionToggle.emit($event)"
					(event)="event.emit($event)"
				></cx-hierarchy-title>
			</ng-container>
			<ng-container *ngIf="type === 'SELECTION'">
				<cx-hierarchy-selection
					[tree]="tree"
					[paddingPrefix]="childPaddingLeft - childPadding"
					[requireRequired]="requireRequired"
					(collapsibleToggle)="collapsibleToggle.emit($event)"
					(selectionToggle)="selectionToggle.emit($event)"
					(event)="event.emit($event)"
				></cx-hierarchy-selection>
			</ng-container>
			<ng-container *ngIf="type === 'COLLAPSIBLE'">
				<cx-hierarchy-collapsible
					[tree]="tree"
					[paddingPrefix]="childPaddingLeft - childPadding"
					[requireRequired]="requireRequired"
					(collapsibleToggle)="collapsibleToggle.emit($event)"
					(selectionToggle)="selectionToggle.emit($event)"
					(event)="event.emit($event)"
				></cx-hierarchy-collapsible>
			</ng-container>
			<ng-container *ngIf="type === 'COLLAPSIBLE_SELECTION'">
				<cx-hierarchy-collapsible-selection
					[tree]="tree"
					[paddingPrefix]="childPaddingLeft - childPadding"
					[requireRequired]="requireRequired"
					(collapsibleToggle)="collapsibleToggle.emit($event)"
					(selectionToggle)="selectionToggle.emit($event)"
					(event)="event.emit($event)"
				></cx-hierarchy-collapsible-selection>
			</ng-container>
			<ng-container *ngIf="type === 'COLLAPSIBLE_SELECT_ALL'">
				<cx-hierarchy-collapsible-select-all
					[tree]="tree"
					[paddingPrefix]="childPaddingLeft - childPadding"
					[requireRequired]="requireRequired"
					(collapsibleToggle)="collapsibleToggle.emit($event)"
					(selectionToggle)="selectionToggle.emit($event)"
					(event)="event.emit($event)"
				></cx-hierarchy-collapsible-select-all>
			</ng-container>
		</div>
	`,
	styleUrls: ['./hierarchy-node.component.scss'],
})
export class HierarchyNodeComponent<T> implements OnInit, OnChanges {
	readonly HIERARCHY_NODE = HIERARCHY_NODE;

	@Input() tree: HierarchyNode<T>;

	/** How much padding the parent says this node should have */
	@Input() paddingPrefix = 0;

	aliasPaddingPrefix = 0;

	@Input() requireRequired = false;

	@Output()
	collapsibleToggle: EventEmitter<CollapsibleNode> = new EventEmitter<CollapsibleNode>();

	@Output()
	selectionToggle: EventEmitter<SelectionNode> = new EventEmitter<SelectionNode>();

	/**
	 * You know, we could maybe save space by having this be a single instance and Injectable.
	 */
	@Output() event = new EventEmitter<NodeEvent<T>>();

	/** How much further (in px) this element should be indented under the parent. */
	paddingLeft = 10;

	/** How much further (in px) children should be indented under the parent. */
	childPadding = 10;

	/** Unique ID for the HierarchyNode instance relative to its HierarchySelect instance. */
	id: string;

	/** Node variant type.  Used to select the correct variant node */
	type: string;

	@HostBinding('class.disabled') get disabled(): boolean {
		return this.tree.disabled;
	}

	get childPaddingLeft(): number {
		return (Number(this.paddingPrefix) || 0) + this.childPadding;
	}

	ngOnInit(): void {
		this.setType();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.tree) {
			this.setType();
		}
	}

	private setType(): void {
		if (this.tree instanceof TitleNode) {
			this.type = 'TITLE';
		} else if (this.tree instanceof CollapsibleSelectAllNode) {
			this.type = 'COLLAPSIBLE_SELECT_ALL';
		} else if (this.tree instanceof CollapsibleNode) {
			this.type = 'COLLAPSIBLE';
		} else if (this.tree instanceof SelectionNode) {
			this.type = 'SELECTION';
		} else if (this.tree instanceof CollapsibleSelectionNode) {
			this.type = 'COLLAPSIBLE_SELECTION';
		} else {
			this.type = 'NODE';
		}
	}
}
