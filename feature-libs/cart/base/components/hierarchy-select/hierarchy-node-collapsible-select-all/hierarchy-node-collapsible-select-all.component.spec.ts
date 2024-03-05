/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SapIconPipe } from 'app/shared/pipes/sap-icon.pipe';
import { CollapsibleSelectAllNode } from '../collapsible-select-all-node.model';
import { HierarchyNodeCollapsibleSelectAllComponent } from './hierarchy-node-collapsible-select-all.component';

describe('HierarchyNodeCollapsibleSelectAllComponent', () => {
	let component: HierarchyNodeCollapsibleSelectAllComponent<void>;
	let fixture: ComponentFixture<HierarchyNodeCollapsibleSelectAllComponent<void>>;

	beforeEach(
		waitForAsync(() => {
			TestBed.configureTestingModule({
				declarations: [HierarchyNodeCollapsibleSelectAllComponent, SapIconPipe],
				schemas: [NO_ERRORS_SCHEMA],
			}).compileComponents();
		})
	);

	beforeEach(() => {
		fixture = TestBed.createComponent<HierarchyNodeCollapsibleSelectAllComponent<void>>(HierarchyNodeCollapsibleSelectAllComponent);
		component = fixture.componentInstance;
		component.tree = new CollapsibleSelectAllNode('mock-node', {
			selected: false,
		});
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should be able to set tree data and emit selection event', () => {
		spyOn(component.selectionToggle, 'emit').and.stub();

		component.onSelectAll({
			source: {},
			checked: true,
		} as MatCheckboxChange);

		expect(component.tree.selected).toBeTruthy();
		expect(component.selectionToggle.emit).toHaveBeenCalledTimes(1);
	});
});
