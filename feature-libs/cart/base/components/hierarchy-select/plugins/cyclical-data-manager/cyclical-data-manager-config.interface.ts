/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { CollapsibleSelectionNode } from '../../collapsible-selection-node.model';
import { ValueData } from './value-data.interface';

export interface CyclicalDataManagerConfig<T> {
	firstLevelValueData: Array<ValueData<T>>;
	allValueData: Array<ValueData<T>>;
	selectedValues: Array<T>;
	selectDescendants: boolean;
	newNodeConfig: NewNodeConfig;
}

export type NewNodeConfig = Partial<
	Pick<CollapsibleSelectionNode, 'selectedCheckboxLabel' | 'showCheckboxLabelIfHasChildren' | 'showCheckboxLabelOnHover' | 'unselectedCheckboxLabel'>
>;
