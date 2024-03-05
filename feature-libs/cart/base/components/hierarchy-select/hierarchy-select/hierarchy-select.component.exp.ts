/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

// @ts-ignore
import { experimentOn } from 'component-lab';

import { CollapsibleNode } from '@shared/hierarchy-select';
import { HierarchyNode } from '../hierarchy-node.model';
import { CollapseSiblingsOnOpen, Disable1stLevelOnSelection } from '../plugins/hierarchy-select-plugins';
import { SelectionNode } from '../selection-node.model';
import { TitleNode } from '../title-node.model';

export { CustomBehaviorPlugin } from '../custom-behavior-plugin.interface';

export default experimentOn('Hierarchy select').case('hierarchy select', {
	context: {
		hierarchySelector: {
			tree: new CollapsibleNode('Root', {
				children: [
					new CollapsibleNode('NYLF Experience (Level 1a)', {
						children: [
							new TitleNode('Home', {
								children: [
									new SelectionNode('Article List 1'),
									new SelectionNode('Article List 2', {
										children: [new SelectionNode('Article List 11')],
									}),
								],
								tooltip: 'Home',
							}),
							new TitleNode('Article Browse', {
								children: [new SelectionNode('Main Article List')],
								tooltip: 'Article Browse',
							}),
						],
						tooltip: 'NYLF Experience (Level 1a)',
					}),
					new CollapsibleNode('Level 1b', {
						children: [
							new CollapsibleNode('Level 2', {
								children: [
									new TitleNode('Level 3a', {
										children: [
											new SelectionNode('Level 4a'),
											new SelectionNode('Level 4b', {
												children: [new SelectionNode('Level 5')],
											}),
										],
										tooltip: 'Level 3a',
									}),
									new TitleNode('Level 3b', {
										children: [new SelectionNode('Level 4')],
										tooltip: 'Level 3b',
									}),
								],
							}),
							new CollapsibleNode('Level 2b'),
							new HierarchyNode('Level 2c', { dropzone: 'a' }),
						],
						tooltip: 'Level 1b',
					}),
					new CollapsibleNode('Level 1c', { tooltip: 'Level 1c' }),
					new HierarchyNode('Level 1d', { dropzone: 'a' }),
					new HierarchyNode('Level 1e', { dropzone: 'a' }),
				],
			}),
			customHandlers: [new Disable1stLevelOnSelection(), new CollapseSiblingsOnOpen()],
			handleDrop($event): void {
				// eslint-disable-next-line no-console
				console.log('hierarchySelector.handleDrop', $event);
			},
			handleChange($event): void {
				// eslint-disable-next-line no-console
				console.log('hierarchySelector.handleChange', $event);
			},
			handleSelections(selections: Array<SelectionNode>): void {
				// eslint-disable-next-line no-console
				console.log('hierarchySelector.handleSelections', selections);
				this.value = selections.map(
					selection =>
						new SelectionNode(selection.name, {
							value: selection.value,
							selected: selection.selected,
						})
				);
			},
			value: [],
		},
	},
	template: `
			<app-hierarchy-select style="width: 320px; display: block;"
					[tree]="hierarchySelector.tree"
					[handlers]="hierarchySelector.customHandlers"
					[drop]="hierarchySelector.handleDrop"
					(change)="hierarchySelector.handleChange"
					(selections)="hierarchySelector.handleSelections($event)">
			</app-hierarchy-select>
		`,
});
