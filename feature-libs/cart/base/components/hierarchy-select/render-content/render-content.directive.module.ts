/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { RenderContentDirective } from './render-content.directive';

@NgModule({
	imports: [CommonModule],
	declarations: [RenderContentDirective],
	exports: [RenderContentDirective],
})
export class RenderContentDirectiveModule {}
