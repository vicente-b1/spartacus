/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import {
	IconModule,
  } from '@spartacus/storefront';
import { RenderContentDirectiveModule } from './render-content/render-content.directive.module';
// import { UpscaleMaterialModule } from 'app/shared/upscale-material/upscale-material.module';
// import { PipesModule } from '../pipes/pipes.module';

import { ChildSelectorComponentModule } from './child-selector';
import { HierarchyCollapsibleSelectionComponent } from './hierarchy-node-collapsible-selection/hierarchy-node-collapsible-selection.component';
import { HierarchyNodeCollapsibleComponent } from './hierarchy-node-collapsible/hierarchy-node-collapsible.component';
import { HierarchyNodeCollapsibleSelectAllComponent } from './hierarchy-node-collapsible-select-all/hierarchy-node-collapsible-select-all.component';
import { HierarchyNodeComponent } from './hierarchy-node/hierarchy-node.component';
import { HierarchyNodeSelectionComponent } from './hierarchy-node-selection/hierarchy-node-selection.component';
import { HierarchyNodeTitleComponent } from './hierarchy-node-title/hierarchy-node-title.component';
import { HierarchySelectComponent } from './hierarchy-select/hierarchy-select.component';
import { CartSharedModule } from '../cart-shared';
import { I18nModule } from '@spartacus/core';


@NgModule({
	imports: [ReactiveFormsModule,
		//  UpscaleMaterialModule,
		 ChildSelectorComponentModule, CommonModule, FormsModule, RenderContentDirectiveModule,IconModule, CartSharedModule, I18nModule
		//  PipesModule
		],
	exports: [HierarchySelectComponent, HierarchyCollapsibleSelectionComponent, HierarchyNodeComponent],
	declarations: [
		HierarchyNodeCollapsibleComponent,
		HierarchyNodeSelectionComponent,
		HierarchyNodeTitleComponent,
		HierarchyNodeComponent,
		HierarchySelectComponent,
		HierarchyCollapsibleSelectionComponent,
		HierarchyNodeCollapsibleSelectAllComponent,
	],
})
export class HierarchySelectModule {}
