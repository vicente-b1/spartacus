/**
 * 2024 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component, HostBinding } from '@angular/core';

import { CollapsibleNode } from '../collapsible-node.model';
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
    >
    </cx-hierarchy-node>
    <!-- <ng-container *ngIf="tree.children.length === 0">
      <cx-cart-item-list
        *ngIf="tree.value.entries.length > 0"
        [items]="this.tree.value.entries!"
        [hasHeader]="false"
      ></cx-cart-item-list>
    </ng-container> -->
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
{
  childPadding = 20;

  tree: CollapsibleNode<T>;

  @HostBinding('class.open') get open(): boolean {
    return this.tree.open;
  }

  toggle(): void {
    if (!this.tree.disabled) {
      this.tree.open = !this.tree.open;
    }
  }

  editBundle(entryGroupNumber: number) {
    console.log('editBundle: ', entryGroupNumber);
  }
}
