/**
 * 2024 SAP SE or an SAP affiliate company. All rights reserved.
 */

import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { HierarchyNode } from './hierarchy-node.model';
import { TitleNode } from '../hierarchy-node-title/title-node.model';
import { CollapsibleNode } from '../hierarchy-node-collapsible/collapsible-node.model';

@Component({
  selector: 'cx-hierarchy-node',
  template: `
    <div>
      <ng-container *ngIf="type === 'TITLE'">
        <cx-hierarchy-title
          [tree]="tree"
          [paddingPrefix]="childPaddingLeft - childPadding"
        ></cx-hierarchy-title>
      </ng-container>
      <ng-container *ngIf="type === 'COLLAPSIBLE'">
        <cx-hierarchy-collapsible
          [tree]="collasibleTree"
          [paddingPrefix]="childPaddingLeft - childPadding"
          [template]="template"
        ></cx-hierarchy-collapsible>
      </ng-container>
    </div>
  `,
  styleUrls: ['./hierarchy-node.component.scss'],
})
export class HierarchyNodeComponent<T> implements OnInit, OnChanges {
  @Input() tree: HierarchyNode<T>;

  /** How much padding the parent says this node should have */
  @Input() paddingPrefix = 0;

  @Input() template: TemplateRef<any>;

  /** How much further (in px) this element should be indented under the parent. */
  paddingLeft = 10;

  /** How much further (in px) children should be indented under the parent. */
  childPadding = 10;

  /** Node variant type.  Used to select the correct variant node */
  type: string;

  collasibleTree: CollapsibleNode<T>;

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
    } else if (this.tree instanceof CollapsibleNode) {
      this.type = 'COLLAPSIBLE';
      this.collasibleTree = this.tree;
    }
  }
}
