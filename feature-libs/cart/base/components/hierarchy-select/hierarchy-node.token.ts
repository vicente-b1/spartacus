/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { InjectionToken } from '@angular/core';

import { HierarchyNode } from './hierarchy-node.model';

export const HIERARCHY_NODE = new InjectionToken<HierarchyNode<any>>('Hierarchy node for component injections.');
