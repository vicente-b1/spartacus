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
// import { EntryGroup, OrderEntry } from 'feature-libs/cart/base/root/models';

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
    >
      <span class="leaf-node-title">{{ tree.name }}</span>

      <button *ngIf="tree.children.length === 0; else noneLeafNode"
        (click)="editBundle(tree.value.entryGroupNumber)" class="btn btn-tertiary" type="button">
        {{ 'common.edit' | cxTranslate }}
      </button>

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
    <ng-container *ngIf="tree.children.length === 0">
      <cx-cart-item-list
        *ngIf="tree.value.entries.length > 0"
        [items]="this.tree.value.entries!"
        [hasHeader]="false"
      ></cx-cart-item-list>

      <!-- <ng-template
          [cxOutlet]="cartOutlets.CART_ITEM_LIST"
          [cxOutletContext]="{
            items: this.tree.value.entries!,
            hasHeader:false
          }"
        >
        </ng-template> -->

    </ng-container>
    <ng-template #noneLeafNode>
      <div *ngIf="!open" class="tree-icon">
        <cx-icon type="EXPAND"></cx-icon>
      </div>
      <div *ngIf="open" class="tree-icon">
        <cx-icon type="COLLAPSE"></cx-icon>
      </div>
    </ng-template>
  `,
  styleUrls: [
    '../hierarchy-node/hierarchy-node.component.scss',
    './hierarchy-node-collapsible.component.scss',
  ],
})
export class HierarchyNodeCollapsibleComponent<T>
  extends HierarchyNodeComponent<T>
  implements OnDestroy, OnInit
{
  childPadding = 20;

  tree: CollapsibleNode<T>;

  @HostBinding('class.open') get open(): boolean {
    return this.tree.open;
  }

  private lazyLoadFactory: LazyLoadFactory<T>;

  private lazyLoad: Observable<Array<HierarchyNode<T>>>;

  private subTracker = new SubscriptionTracker();

  // orderEnrties: OrderEntry[]= [];

  // orderEntryGroups: OrderEntryGroup;

  ngOnDestroy(): void {
    this.subTracker.unsubscribe();
  }

  ngOnInit(): void {
    this.lazyLoadFactory = this.tree.lazyLoadFactory;
    // this.entryGroups = this.tree.value as EntryGroup;
    // this.tree.value.entries?.forEach((entry: OrderEntry) => {
    // 	this.orderEnrties.push(entry);
    // });
  }

  toggle(): void {
    if (!this.tree.disabled) {
      this.tree.open = !this.tree.open;

      if (this.tree.open) {
        if (
          this.lazyLoadFactory &&
          !this.lazyLoad &&
          !this.tree.children?.length
        ) {
          this.lazyLoad = this.lazyLoadFactory(this.tree);

          this.subTracker.sub = this.lazyLoad.subscribe((children) => {
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

  editBundle(entryGroupNumber: number) {
    console.log('editBundle: ', entryGroupNumber);
  }
}
