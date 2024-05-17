/**
 * 2024 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component } from '@angular/core';
import { HierarchyNodeComponent } from '../hierarchy-node/hierarchy-node.component';
import { TitleNode } from './title-node.model';
// import { ActiveCartFacade } from '@spartacus/cart/base/root';

/**
 * Hierarchy Selection node variant to show a title
 */
@Component({
  selector: 'cx-hierarchy-title',
  template: `
    <div class="cx-hierarchy-node title">
      <span class="node-title">{{ tree.name }}</span>
      <button (click)="removeBundle(tree.value.entryGroupNumber)" class="btn btn-tertiary" type="button">
        {{ 'common.remove' | cxTranslate }}
      </button>
    </div>
  `,
  styleUrls: [
    '../hierarchy-node/hierarchy-node.component.scss',
    './hierarchy-node-title.component.scss',
  ],
})
export class HierarchyNodeTitleComponent<T> extends HierarchyNodeComponent<T> {
  tree: TitleNode;
  // activeCartService: ActiveCartFacade = inject(ActiveCartFacade);

  removeBundle(entryGroupNumber: number) {
    // this.activeCartService.removeEntryGroup(entryGroupNumber);
    console.log('removeBundle in ' + entryGroupNumber);
  }
}
