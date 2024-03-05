/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CommonModule } from '@angular/common';
// import { MatButtonModule } from '@angular/material/button';
import { NgModule } from '@angular/core';

import { ChildSelectorComponent } from './child-selector.component';

@NgModule({
	imports: [CommonModule
		// , MatButtonModule
	],
	declarations: [ChildSelectorComponent],
	exports: [ChildSelectorComponent],
})
export class ChildSelectorComponentModule {}
