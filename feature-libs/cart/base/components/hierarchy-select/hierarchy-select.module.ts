/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { IconModule } from '@spartacus/storefront';
import { RenderContentDirectiveModule } from './render-content/render-content.directive.module';

import { ChildSelectorComponentModule } from './child-selector';
import { HierarchyNodeCollapsibleComponent } from './hierarchy-node-collapsible/hierarchy-node-collapsible.component';
import { HierarchyNodeComponent } from './hierarchy-node/hierarchy-node.component';
import { HierarchyNodeTitleComponent } from './hierarchy-node-title/hierarchy-node-title.component';
import { HierarchySelectComponent } from './hierarchy-select/hierarchy-select.component';
import { CartSharedModule } from '../cart-shared';
import { I18nModule } from '@spartacus/core';

@NgModule({
	imports: [
		ReactiveFormsModule, 
		ChildSelectorComponentModule, 
		CommonModule, 
		FormsModule, 
		RenderContentDirectiveModule,
		IconModule, 
		CartSharedModule, 
		I18nModule ],
	exports: [HierarchySelectComponent, HierarchyNodeComponent],
	declarations: [
		HierarchyNodeCollapsibleComponent,
		HierarchyNodeTitleComponent,
		HierarchyNodeComponent,
		HierarchySelectComponent,
	],
})
export class HierarchySelectModule {}
