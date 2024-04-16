/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { buffer, take } from 'rxjs/operators';

import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { CollapsibleNode } from '../index';
import { NodeEvent, NodeEventType, Select } from '../events';
import { HierarchyNode } from '../hierarchy-node.model';
import { SelectionNode } from '../selection-node.model';

/**
 * Selector component that displays a tree-based model.
 * Also provides an optional search field to search through the tree.
 */
@Component({
	providers: [],
	selector: 'cx-hierarchy-select',
	template: `
		<div *ngIf="!disabled" [style.border-bottom-width.px]="showBorderBottom ? 1 : 0">
			<div class="cx-hierarchy-select" [ngStyle]="hierarchyStyle">
				<cx-hierarchy-node
					*ngFor="let child of tree.children; let i = index"
					[tree]="child"
					[paddingPrefix]="paddingPrefix"
					[requireRequired]="requireRequired"
					(collapsibleToggle)="handleCollapsibleToggle($event)"
					(event)="event.emit($event)"
				></cx-hierarchy-node>
			</div>
		</div>
	`,
	styleUrls: ['./hierarchy-select.component.scss'],
})
export class HierarchySelectComponent<T> implements OnInit, OnChanges {

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

	@Input() requireRequired = false;

	/**
	 * Output a node. This emits when a collapsible node is expanded or collapsed.
	 */
	@Output()
	collapse: EventEmitter<CollapsibleNode> = new EventEmitter<CollapsibleNode>();

	/**
	 * Output array of all selected nodes. This emits when any select node is toggled.
	 */
	@Output() selections: EventEmitter<Array<SelectionNode>> = new EventEmitter<Array<SelectionNode>>();

	@Output() event = new EventEmitter<NodeEvent<T>>();

	/**
	 * Dropzone name for the root level.
	 */
	dropzone = 'root-dropzone';

	/**
	 * Flag to show bottom border if there are no children, which would normally provide the bottom line.
	 */
	showBorderBottom = true;

	/**
	 * Defines the styling object applied to the hierarchy tree.
	 * Note:
	 * - used to provide maxHeight property from consumer.
	 */
	hierarchyStyle: {
		maxHeight: string;
		overflow: string;
	};

	private selectEvent?: Subject<Select<T>>;
	private selectEventSubscription?: Subscription;
	searchField: UntypedFormControl;

	constructor(private fb: UntypedFormBuilder) {
		this.searchField = this.fb.control('');
	}
	  
	/**
	 * Handler for collapse toggle events.
	 */
	handleCollapsibleToggle(node: CollapsibleNode): void {
		this.collapse.emit(node);
	}

	ngOnInit(): void {
		this.calculateShowBottom();

		if (this.maxHeight !== undefined) {
			this.hierarchyStyle = {
				maxHeight: this.maxHeight,
				overflow: 'auto',
			};
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.tree) {
			this.calculateShowBottom();
		}
	}

	onNodeEvent(event: NodeEvent<T>): void {
		if (event.type === NodeEventType.SELECT) {
			this.createSelectEvent(event);
		} else {
			this.event.emit(event);
		}
	}

	private calculateShowBottom(): void {
		this.showBorderBottom = !this.tree || this.tree?.children.length === 0;
	}

	private createSelectEvent(event: Select<T>): void {
		if (!this.selectEvent) {
			this.selectEvent = new Subject<Select<T>>();
			this.selectEventSubscription = this.selectEvent.pipe(buffer(timer(300)), take(1)).subscribe(events => {
				const selectEvent: Select<T> = {
					nodes: events.reduce((n, e) => n.concat(e.nodes), [] as Array<{ node: HierarchyNode<T>; selected: boolean }>),
					type: NodeEventType.SELECT,
				};

				this.event.emit(selectEvent);

				this.selectEventSubscription?.unsubscribe();
				this.selectEvent = this.selectEventSubscription = undefined;
			});
		} else {
			this.selectEvent.next(event);
		}
	}
}
