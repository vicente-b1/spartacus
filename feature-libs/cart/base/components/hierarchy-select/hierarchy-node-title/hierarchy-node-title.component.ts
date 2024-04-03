/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component } from '@angular/core';

import { HierarchyNodeComponent } from '../hierarchy-node/hierarchy-node.component';
import { TitleNode } from '../title-node.model';

/**
 * Hierarchy Selection node variant to show a title
 */
@Component({
  selector: 'cx-hierarchy-title',
  template: `
    <div
      class="cx-hierarchy-node title"
      [style.padding-left.px]="paddingPrefix"
      [title]="tree.tooltip"
      matTooltipPosition="right"
      matTooltipShowDelay="1200"
    >
      <span class="node-title">{{ tree.name }}</span>
      <span class="node-edit">REMOVE</span>
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
  styleUrls: [
    '../hierarchy-node/hierarchy-node.component.scss',
    './hierarchy-node-title.component.scss',
  ],
})
export class HierarchyNodeTitleComponent<T> extends HierarchyNodeComponent<T> {
  tree: TitleNode;
}
