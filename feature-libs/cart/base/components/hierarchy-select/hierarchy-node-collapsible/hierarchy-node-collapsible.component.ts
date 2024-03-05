/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SubscriptionTracker } from '../utils';

import { CollapsibleNode, LazyLoadFactory } from '../collapsible-node.model';
import { LoadChildren, NodeEventType } from '../events';
import { HierarchyNode } from '../hierarchy-node.model';
import { HierarchyNodeComponent } from '../hierarchy-node/hierarchy-node.component';

/**
 * Hierarchy Selection node variant that is collapsible
 */
@Component({
	selector: 'cx-hierarchy-collapsible',
	template: `
		<div
			class="cx-hierarchy-node collapsible"
			[style.padding-left.px]="paddingPrefix"
			(click)="toggle()"
			[title]="tree.tooltip"
			matTooltipPosition="right"
			matTooltipShowDelay="1200"
		>
			<!-- <mat-icon *ngIf="!open">{{ 'navigation-right-arrow' | sapIcon }}</mat-icon>
			<mat-icon *ngIf="open">{{ 'navigation-down-arrow' | sapIcon }}</mat-icon> -->
			<span *ngIf="!open">>>123</span>
			<span *ngIf="open">V123(down)</span>
			<div class="border"></div>
			<span>{{ tree.name }}</span>
		</div>
		<cx-hierarchy-node
			*ngFor="let child of tree.children; let i = index"
			[tree]="child"
			[paddingPrefix]="childPaddingLeft"
			[requireRequired]="requireRequired"
			(collapsibleToggle)="collapsibleToggle.emit($event)"
			(selectionToggle)="selectionToggle.emit($event)"
			(event)="event.emit($event)"
		>
	</cx-hierarchy-node>
		<ng-container *ngIf="tree.children.length === 0" >
		<!-- <div *ngFor="let entry of tree.value.entries">
		{{entry.product.name}}
		</div> 
	 [cartIsLoading]="!(cartLoaded$ | async)"
	 [promotionLocation]="promotionLocation"
	         [options]="{
          isSaveForLater: false,
          optionalBtn: saveForLaterBtn
        }"
	-->
		<cx-cart-item-list
        [items]="tree.value.entries"

      ></cx-cart-item-list>
		</ng-container>
	`,
	styleUrls: ['../hierarchy-node/hierarchy-node.component.scss', './hierarchy-node-collapsible.component.scss'],
})
export class HierarchyNodeCollapsibleComponent<T> extends HierarchyNodeComponent<T> implements OnDestroy, OnInit {
	childPadding = 20;

	tree: CollapsibleNode<T>;

	@HostBinding('class.open') get open(): boolean {
		return this.tree.open;
	}

	private lazyLoadFactory: LazyLoadFactory<T>;

	private lazyLoad: Observable<Array<HierarchyNode<T>>>;

	private subTracker = new SubscriptionTracker();

	ngOnDestroy(): void {
		this.subTracker.unsubscribe();
	}

	ngOnInit(): void {
		this.lazyLoadFactory = this.tree.lazyLoadFactory;
	}

	toggle(): void {
		if (!this.tree.disabled) {
			this.tree.open = !this.tree.open;

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

			this.collapsibleToggle.emit(this.tree);
		}
	}
}
