/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import {
  Component,
  Input,
  OnInit
} from '@angular/core';
import { HierarchyNode } from '../hierarchy-node.model';

/**
 * Selector component that displays a tree-based model.
 * Also provides an optional search field to search through the tree.
 */
@Component({
  providers: [],
  selector: 'cx-hierarchy-select',
  template: `
    <div *ngIf="!disabled">
      <div class="cx-hierarchy-select" [ngStyle]="hierarchyStyle">
        <cx-hierarchy-node
          *ngFor="let child of tree.children; let i = index"
          [tree]="child"
          [paddingPrefix]="paddingPrefix"
        ></cx-hierarchy-node>
      </div>
    </div>
  `,
  styleUrls: ['./hierarchy-select.component.scss'],
})
export class HierarchySelectComponent implements OnInit {
  /**
   * Defines the maximum height of visible part of the tree.
   */
  @Input() maxHeight: string;
  /**
   * Root node of the tree model.  The children of this node are used to populate the selector view
   */
  @Input() tree: HierarchyNode;

  /**
   * Adjustable starting padding for the rows.
   */
  @Input() paddingPrefix = 0;

  @Input() disabled: boolean;

  /**
   * Defines the styling object applied to the hierarchy tree.
   * Note:
   * - used to provide maxHeight property from consumer.
   */
  hierarchyStyle: {
    maxHeight: string;
    overflow: string;
  };

  ngOnInit(): void {
    if (this.maxHeight !== undefined) {
      this.hierarchyStyle = {
        maxHeight: this.maxHeight,
        overflow: 'auto',
      };
    }
  }
}
