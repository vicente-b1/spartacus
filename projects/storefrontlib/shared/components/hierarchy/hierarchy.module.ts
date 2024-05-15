/**
 * 2024 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { IconModule } from '@spartacus/storefront';
import { HierarchyNodeCollapsibleComponent } from './hierarchy-node-collapsible/hierarchy-node-collapsible.component';
import { HierarchyNodeComponent } from './hierarchy-node/hierarchy-node.component';
import { HierarchyNodeTitleComponent } from './hierarchy-node-title/hierarchy-node-title.component';
import { HierarchyComponent } from './hierarchy/hierarchy.component';
// import { CartSharedModule } from '@spartacus/cart/base/components';
// import { CmsConfig, I18nModule, provideDefaultConfig } from '@spartacus/core';
import { I18nModule } from '@spartacus/core';
@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    IconModule,
    // CartSharedModule,
    I18nModule,
  ],
  // providers: [
  //   provideDefaultConfig(<CmsConfig>{
  //     cmsComponents: {
  //       HierarchyComponent: {
  //         component:HierarchyComponent,
  //       },
  //     },
  //   }),
  // ],
  exports: [
    HierarchyComponent,
    HierarchyNodeComponent,
    HierarchyNodeTitleComponent,
    HierarchyNodeCollapsibleComponent,
  ],
  declarations: [
    HierarchyNodeCollapsibleComponent,
    HierarchyNodeTitleComponent,
    HierarchyNodeComponent,
    HierarchyComponent,
  ],
})
export class HierarchyModule {}
