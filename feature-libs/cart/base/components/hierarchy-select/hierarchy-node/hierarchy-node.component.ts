/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

import { CollapsibleNode } from '../index';
import { NodeEvent } from '../events';
import { HierarchyNode } from '../hierarchy-node.model';
import { TitleNode } from '../title-node.model';
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
          [tree]="tree"
          [paddingPrefix]="childPaddingLeft - childPadding"
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

  aliasPaddingPrefix = 0;

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
    } else if (this.tree instanceof CollapsibleNode) {
      this.type = 'COLLAPSIBLE';
    }
  }
}
