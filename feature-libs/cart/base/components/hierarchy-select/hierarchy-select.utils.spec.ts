/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CollapsibleSelectAllNode } from './collapsible-select-all-node.model';
import { CollapsibleSelectionNode } from './collapsible-selection-node.model';
import { HierarchyNode } from './hierarchy-node.model';
import { SelectionNode } from './selection-node.model';
import { filterHierarchy, getSelectedNodes, hasMatch } from './hierarchy-select.utils';

const newCollapsibleSelectionNode = (value: string, overrides: Partial<CollapsibleSelectionNode> = {}): CollapsibleSelectionNode =>
	new CollapsibleSelectionNode(value, {
		value,
		...overrides,
	});

const value1 = 'node1';
const value2 = 'node2';
const value3 = 'node3';
const value4 = 'node4';
const value5 = 'node5';

const hierarchyRoot = new HierarchyNode<string>('root', {
	children: [
		newCollapsibleSelectionNode(value1, {
			children: [
				newCollapsibleSelectionNode(value2, {
					children: [
						newCollapsibleSelectionNode(value3, {
							children: [
								newCollapsibleSelectionNode(value4, {
									children: [newCollapsibleSelectionNode(value5)],
								}),
								newCollapsibleSelectionNode(value5),
							],
						}),
						newCollapsibleSelectionNode(value4, {
							children: [newCollapsibleSelectionNode(value5)],
						}),
					],
				}),
				newCollapsibleSelectionNode(value3, {
					children: [
						newCollapsibleSelectionNode(value4, {
							children: [newCollapsibleSelectionNode(value5)],
						}),
						newCollapsibleSelectionNode(value5),
					],
				}),
			],
		}),
	],
});

describe('filterHierarchy', () => {
	it('should expand all nodes which match the search criteria, or are the ancestor of a match. should hide/collapse all others', () => {
		const filteredHierarchy = new HierarchyNode<string>('root', {
			children: [
				newCollapsibleSelectionNode(value1, {
					open: true,
					children: [
						newCollapsibleSelectionNode(value2, {
							open: true,
							children: [
								newCollapsibleSelectionNode(value3, {
									children: [
										newCollapsibleSelectionNode(value4, {
											hidden: true,
											children: [
												newCollapsibleSelectionNode(value5, {
													hidden: true,
												}),
											],
										}),
										newCollapsibleSelectionNode(value5, {
											hidden: true,
										}),
									],
								}),
								newCollapsibleSelectionNode(value4, {
									hidden: true,
									children: [
										newCollapsibleSelectionNode(value5, {
											hidden: true,
										}),
									],
								}),
							],
						}),
						newCollapsibleSelectionNode(value3, {
							children: [
								newCollapsibleSelectionNode(value4, {
									hidden: true,
									children: [
										newCollapsibleSelectionNode(value5, {
											hidden: true,
										}),
									],
								}),
								newCollapsibleSelectionNode(value5, {
									hidden: true,
								}),
							],
						}),
					],
				}),
			],
		});

		filterHierarchy(hierarchyRoot, { field: 'name', value: 'node3' });
		expect(hierarchyRoot).toEqual(filteredHierarchy);
	});
});

describe('resetHierarchy', () => {
	const expectedHierarchy = new HierarchyNode<string>('root', {
		children: [
			newCollapsibleSelectionNode(value1, {
				children: [
					newCollapsibleSelectionNode(value2, {
						children: [
							newCollapsibleSelectionNode(value3, {
								children: [
									newCollapsibleSelectionNode(value4, {
										children: [newCollapsibleSelectionNode(value5)],
									}),
									newCollapsibleSelectionNode(value5),
								],
							}),
							newCollapsibleSelectionNode(value4, {
								children: [newCollapsibleSelectionNode(value5)],
							}),
						],
					}),
					newCollapsibleSelectionNode(value3, {
						children: [
							newCollapsibleSelectionNode(value4, {
								children: [newCollapsibleSelectionNode(value5)],
							}),
							newCollapsibleSelectionNode(value5),
						],
					}),
				],
			}),
		],
	});

	it('should reset hierarchy to pristine state', () => {
		filterHierarchy(hierarchyRoot, { field: 'name', value: 'node3' });
		filterHierarchy(hierarchyRoot, { field: 'name', value: '' });
		expect(hierarchyRoot).toEqual(expectedHierarchy);
	});
});

describe('getSelectedNodes', () => {
	const hierarchyWithSelections = new HierarchyNode<string>('root', {
		children: [
			newCollapsibleSelectionNode(value1, {
				children: [
					newCollapsibleSelectionNode(value2, {
						selected: true,
						children: [
							newCollapsibleSelectionNode(value3, {
								children: [
									newCollapsibleSelectionNode(value4, {
										children: [newCollapsibleSelectionNode(value5)],
									}),
									newCollapsibleSelectionNode(value5),
								],
							}),
							newCollapsibleSelectionNode(value4, {
								selected: true,
								children: [newCollapsibleSelectionNode(value5)],
							}),
						],
					}),
					newCollapsibleSelectionNode(value3, {
						children: [
							newCollapsibleSelectionNode(value4, {
								children: [
									newCollapsibleSelectionNode(value5, {
										selected: true,
									}),
								],
							}),
							newCollapsibleSelectionNode(value5),
						],
					}),
				],
			}),
		],
	});

	it('should recursively return all selected nodes within hierarchy', () => {
		const selectedNodes = getSelectedNodes(hierarchyWithSelections);

		expect(selectedNodes).toEqual([
			hierarchyWithSelections.children[0].children[0],
			hierarchyWithSelections.children[0].children[0].children[1],
			hierarchyWithSelections.children[0].children[1].children[0].children[0],
		] as Array<SelectionNode>);
	});

	it('should not include CollapsibleSelectAllNode', () => {
		const root = new HierarchyNode<string>('root', {
			children: [
				new CollapsibleSelectAllNode('collapsibleSelectAll', {
					selected: true,
				}),
				new SelectionNode('selection', { selected: true }),
			],
		});

		const selectedNodes = getSelectedNodes(root);

		expect(selectedNodes).toEqual([root.children[1]] as Array<SelectionNode>);
		expect(selectedNodes[0] instanceof CollapsibleSelectAllNode).toBeFalsy();
	});
});

describe('hasMatch', () => {
	it('should match value if value has criteria field with value containing criteria value', () => {
		const searchCriteria = {
			field: 'name',
			value: 'ab',
		};

		const valueToCheck = {
			name: 'Absolutely matches',
		};

		const matches = hasMatch(valueToCheck, searchCriteria);

		expect(matches).toBe(true);
	});

	it('should match value if value is string which contains criteria value', () => {
		const searchCriteria = {
			field: '',
			value: 'ab',
		};

		const valueToCheck = 'Absolutely matches';

		const matches = hasMatch(valueToCheck, searchCriteria);

		expect(matches).toBe(true);
	});

	it('should not match value, value criteria field does not contain criteria value', () => {
		const searchCriteria = {
			field: 'name',
			value: 'ab',
		};

		const valueToCheck = {
			name: 'Does not match',
		};

		const matches = hasMatch(valueToCheck, searchCriteria);

		expect(matches).toBe(false);
	});

	it('should not match value, value does not contain criteria value', () => {
		const searchCriteria = {
			field: '',
			value: 'ab',
		};

		const valueToCheck = 'Does not match';

		const matches = hasMatch(valueToCheck, searchCriteria);

		expect(matches).toBe(false);
	});
});
