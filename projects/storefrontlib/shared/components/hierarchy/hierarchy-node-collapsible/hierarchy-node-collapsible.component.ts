/**
 * 2024 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component, HostBinding, Input, TemplateRef } from '@angular/core';
import { CollapsibleNode } from './collapsible-node.model';

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
        (click)="editBundle(tree.value?.entryGroupNumber)" class="btn btn-tertiary" type="button">
        {{ 'common.edit' | cxTranslate }}
      </button>
    </div>
    <cx-hierarchy-collapsible
      *ngFor="let child of collapsibleChildren; let i = index"
      [tree]="child"
      [paddingPrefix]="childPaddingLeft"
      [template]="template"
    >
    </cx-hierarchy-collapsible>
    <ng-container *ngIf="tree.children.length === 0 ">
      <ng-container *ngTemplateOutlet="template; context:{ $implicit: this.tree.value?.entries}"></ng-container>
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
    // '../hierarchy-node/hierarchy-node.component.scss',
    './hierarchy-node-collapsible.component.scss',
  ],
})
export class HierarchyNodeCollapsibleComponent<T> {
  // extends HierarchyNodeComponent<T>
  /** How much padding the parent says this node should have */
  @Input() paddingPrefix = 0;

  @Input() template: TemplateRef<any>;

  @Input() tree: CollapsibleNode<T>;

  childPadding = 20;

  @HostBinding('class.open') get open(): boolean {
    return this.tree.open;
  }

  toggle(): void {
    if (!this.tree.disabled) {
      this.tree.open = !this.tree.open;
    }
  }

  get childPaddingLeft(): number {
    return (Number(this.paddingPrefix) || 0) + this.childPadding;
  }

  get collapsibleChildren(): CollapsibleNode<T>[] {
    return this.tree.children as CollapsibleNode<T>[];
  }

  editBundle(entryGroupNumber: any) {
    console.log('editBundle: ', entryGroupNumber);
  }
}
