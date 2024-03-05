/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component, HostBinding, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SubscriptionTracker } from '../utils';

import { CollapsibleSelectionNode } from '../collapsible-selection-node.model';
import { HierarchyNode } from '../hierarchy-node.model';
import { HierarchyNodeSelectionComponent } from '../hierarchy-node-selection/hierarchy-node-selection.component';
import { HierarchyNodeSelectionService } from '../hierarchy-node-selection/hierarchy-node-selection.service';
import { LazyLoadFactory } from '../collapsible-node.model';
import { LoadChildren, NodeEvent, NodeEventType, Select } from '../events';

@Component({
	selector: 'cx-hierarchy-collapsible-selection',
	template: `
		<div
			class="cx-hierarchy-node"
			[class.leaf-node]="!hasChildren"
			[style.padding-left.px]="paddingPrefix"
			[class.selected]="tree.fullRowSelect && tree.selected"
			[class.hidden]="tree.hidden"
			[class.show]="tree.dontHideTheExpandCollapseAndBorderForAnyReason"
			[title]="tree.tooltip"
			matTooltipPosition="right"
			matTooltipShowDelay="1200"
		>
			<ng-container *ngIf="!tree.fullRowToggle">
				<div *ngIf="!tree.fullRowSelect" class="cx-hierarchy-node__expand" (click)="toggle()">
					<div class="cx-hierarchy-node__chevron">
					<span *ngIf="!open">>></span>
					<span *ngIf="open">V(down)</span>
						<!-- <mat-icon *ngIf="!open">{{ 'navigation-right-arrow' | sapIcon }}</mat-icon>
						<mat-icon *ngIf="open">{{ 'navigation-down-arrow' | sapIcon }}</mat-icon> -->
					</div>
					<div class="cx-hierarchy-node__border"></div>
					<div class="cx-hierarchy-node__name" *renderContent="tree.contentTemplate; context: this; token: HIERARCHY_NODE">
						{{ tree.name }}
					</div>
					<cx-child-selector class="child-selector" *ngIf="tree.addAll" [showRemove]="tree.removeAll" (addAll)="addAll()" (removeAll)="removeAll()"></cx-child-selector>
				</div>
				<ng-container *ngIf="!tree.hideSelect">
					<mat-checkbox
						*ngIf="!tree.fullRowSelect"
						class="cx-hierarchy-node__checkbox"
						labelPosition="before"
						[class.show-label-if-has-children]="tree.showCheckboxLabelIfHasChildren && !hasChildren"
						[class.show-label-on-hover]="tree.showCheckboxLabelOnHover"
						[(ngModel)]="selected"
						[disabled]="tree.disabled"
						>{{ checkboxLabel }}</mat-checkbox
					>
				</ng-container>
				<div *ngIf="tree.fullRowSelect" class="cx-hierarchy-node__expand">
					<div class="cx-hierarchy-node__chevron" (click)="toggle()">
						<!-- <mat-icon *ngIf="!open">{{ 'navigation-right-arrow' | sapIcon }}</mat-icon>
						<mat-icon *ngIf="open">{{ 'navigation-down-arrow' | sapIcon }}</mat-icon> -->
						<span *ngIf="!open">>></span>
						<span *ngIf="open">V(down)</span>
					</div>
					<div class="cx-hierarchy-node__fullRow" (click)="select()">
						{{ tree.name }}
					</div>
					<cx-child-selector class="child-selector" *ngIf="tree.addAll" [showRemove]="tree.removeAll" (addAll)="addAll()" (removeAll)="removeAll()">
					</cx-child-selector>
				</div>
			</ng-container>
			<ng-container *ngIf="tree.fullRowToggle">
				<div *ngIf="!tree.fullRowSelect" class="cx-hierarchy-node__expand">
					<div class="cx-hierarchy-node__chevron" (click)="toggle()">
						<!-- <mat-icon *ngIf="!open">{{ 'navigation-right-arrow' | sapIcon }}</mat-icon>
						<mat-icon *ngIf="open">{{ 'navigation-down-arrow' | sapIcon }}</mat-icon> -->
						<span *ngIf="!open">>></span>
						<span *ngIf="open">V(down)</span>
					</div>
					<div class="cx-hierarchy-node__fullRow" *renderContent="tree.contentTemplate; context: this; token: HIERARCHY_NODE">
					<!-- <div class="cx-hierarchy-node__fullRow" *renderContent="tree.contentTemplate; renderContentContext: void; renderContentToken: HIERARCHY_NODE" (click)="toggle()"> -->
						{{ tree.name }}
					</div>
					<cx-child-selector class="child-selector" *ngIf="tree.addAll" [showRemove]="tree.removeAll" (addAll)="addAll()" (removeAll)="removeAll()">
					</cx-child-selector>
				</div>
			</ng-container>
		</div>
		<cx-hierarchy-node
			*ngFor="let child of tree.children; let i = index"
			[tree]="child"
			[paddingPrefix]="childPaddingLeft"
			(collapsibleToggle)="collapsibleToggle.emit($event)"
			(selectionToggle)="selectionToggle.emit($event)"
			(event)="onEvent($event)"
		></cx-hierarchy-node>
	`,
	styleUrls: ['./hierarchy-node-collapsible-selection.component.scss', '../hierarchy-node/hierarchy-node.component.scss'],
})
export class HierarchyCollapsibleSelectionComponent<T> extends HierarchyNodeSelectionComponent<T> implements OnInit {
	childPadding = 20;

	tree: CollapsibleSelectionNode;

	/** Returns true if node has childValues or children. Otherwise, returns false. */
	get hasChildren(): boolean {
		return this.tree.childValues.length > 0 || this.tree.children.length > 0;
	}

	/** Sets which checkboxLabel to show based on whether or not node is selected. */
	get checkboxLabel(): string {
		return this.selected ? this.tree.selectedCheckboxLabel : this.tree.unselectedCheckboxLabel;
	}

	/** Adds 'open' class to host element if node is open. */
	@HostBinding('class.open') get open(): boolean {
		return this.tree.open;
	}

	private lazyLoadFactory: LazyLoadFactory<T>;

	private lazyLoad: Observable<Array<HierarchyNode<T>>>;

	private subTracker = new SubscriptionTracker();

	constructor(hierarchyNodeSelectionService: HierarchyNodeSelectionService) {
		super(hierarchyNodeSelectionService);
	}

	ngOnInit(): void {
		super.ngOnInit();

		this.lazyLoadFactory = this.tree.lazyLoadFactory;
	}

	addAll(): void {
		this.event.emit({
			node: this.tree,
			type: NodeEventType.ADD_ALL,
		});
	}

	onEvent(event: NodeEvent<T>): void {
		this.event.emit(event);
	}

	removeAll(): void {
		this.event.emit({
			node: this.tree,
			type: NodeEventType.REMOVE_ALL,
		});
	}

	/** If node has children and is not disabled, set to open and emit collapsibleToggle event. */
	toggle(): void {
		if (!this.tree.disabled) {
			this.tree.open = !this.tree.open;
			this.collapsibleToggle.emit(this.tree);
		}

		if (this.tree.open) {
			if (this.lazyLoadFactory && !this.lazyLoad && !this.tree.children?.length) {
				this.lazyLoad = this.lazyLoadFactory(this.tree);

				this.subTracker.sub = this.lazyLoad.subscribe(children => {
					this.tree.children = children;
					const event: LoadChildren<T> = {
						node: this.tree,
						children,
						type: NodeEventType.LOAD_CHILDREN,
					};

					this.event.emit(event);
				});
			}
		}
	}

	select(): void {
		this.tree.selected = !this.tree.selected;

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
