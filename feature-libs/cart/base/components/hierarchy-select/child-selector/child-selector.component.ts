/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'cx-child-selector',
	template: `
		<button *ngIf="!showRemove" mat-button color="accent" class="select-all" (click)="onAddAll($event)">Add all</button>
		<button *ngIf="showRemove" mat-button color="accent" class="select-all remove-all" (click)="onRemoveAll($event)">Remove all</button>
	`,
	styleUrls: ['./child-selector.component.scss'],
})
export class ChildSelectorComponent {
	@Input()
	showRemove: boolean;

	@Output()
	addAll: EventEmitter<void> = new EventEmitter();

	@Output()
	removeAll: EventEmitter<void> = new EventEmitter();

	onAddAll(event: Event): void {
		this.addAll.emit();
		event.stopPropagation();
	}

	onRemoveAll(event: Event): void {
		this.removeAll.emit();
		event.stopPropagation();
	}
}
