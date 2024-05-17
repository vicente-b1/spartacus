/**
 * 2024 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
// import { IconModule } from '@spartacus/storefront';
import { HierarchyNodeCollapsibleComponent } from './hierarchy-node-collapsible/hierarchy-node-collapsible.component';
import { HierarchyNodeComponent } from './hierarchy-node/hierarchy-node.component';
import { HierarchyNodeTitleComponent } from './hierarchy-node-title/hierarchy-node-title.component';
import { HierarchyComponent } from './hierarchy/hierarchy.component';
import { I18nModule } from '@spartacus/core';
import { IconModule } from "../../../cms-components/misc/icon/icon.module";
// import { CartSharedModule } from '@spartacus/cart/base/components';
// import { CartSharedModule } from '@spartacus/cart/base/components';
// import { HierarchyNodeCollapsibleModule } from './hierarchy-node-collapsible/hierarchy-node-collapsible.module';
// import { CartSharedModule } from '@spartacus/cart/base/components';

@NgModule({
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
    imports: [
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        I18nModule,
        IconModule,
        // CartSharedModule
        // HierarchyNodeCollapsibleModule,
    ]
})
export class HierarchyModule {}
