/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { buffer, take } from 'rxjs/operators';

import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { CollapsibleNode } from '../index';
import { CustomBehaviorPlugin } from '../index';
import { getSelectedNodes } from '../index';
import { NodeEvent, NodeEventType, Select } from '../events';
import { HierarchyNode } from '../hierarchy-node.model';
import { SelectionNode } from '../selection-node.model';
import { HierarchySelectEventType } from './hierarchy-select-event.enum';


/**
 * Selector component that displays a tree-based model.
 * Also provides an optional search field to search through the tree.
 */
@Component({
	providers: [],
	selector: 'cx-hierarchy-select',
	template: `
		<div [attr.id]="'bundle-' + tree.children[0].value.entryGroupNumber" *ngIf="!disabled" [style.border-bottom-width.px]="showBorderBottom ? 1 : 0">
			<div class="cx-hierarchy-select" [ngStyle]="hierarchyStyle">
				<cx-hierarchy-node					
					*ngFor="let child of tree.children; let i = index"
					[tree]="child"
					[paddingPrefix]="paddingPrefix"
					[requireRequired]="requireRequired"
					(selectionToggle)="handleSelectionToggle($event)"
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

	/**
	 * Array of plugins for extending the behavior of the component when certain events occur.
	 */
	@Input() handlers?: Array<CustomBehaviorPlugin>;

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
	 * Handler for selection toggle events.  Finds all selections and emits them.
	 */
	handleSelectionToggle(node: SelectionNode): void {
		this.handleEvent(node, this.tree, HierarchySelectEventType.SELECT);

		const selections = getSelectedNodes(this.tree);
		this.selections.emit(selections);
	}

	/**
	 * Handler for collapse toggle events.
	 */
	handleCollapsibleToggle(node: CollapsibleNode): void {
		this.collapse.emit(node);

		this.handleEvent(node, this.tree, HierarchySelectEventType.COLLAPSE);
	}

	ngOnInit(): void {
		this.calculateShowBottom();
		this.handleEvent(null, this.tree, HierarchySelectEventType.LOAD);

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

	/**
	 * Processes events to run added custom behavior plugins
	 */
	private handleEvent(node: HierarchyNode, root: HierarchyNode, type: HierarchySelectEventType): void {
		this.handlers?.forEach(handler => handler.callback(node, root, type));
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
