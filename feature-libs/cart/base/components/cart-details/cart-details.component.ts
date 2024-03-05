/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CartConfigService } from '@spartacus/cart/base/core';
import {
  ActiveCartFacade,
  Cart,
  EntryGroup,
  OrderEntry,
  PromotionLocation,
  SelectiveCartFacade,
} from '@spartacus/cart/base/root';
import { AuthService, RoutingService } from '@spartacus/core';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import {
  CollapsibleNode,
  CollapsibleSelectionNode,
  HierarchyNode,
  SelectionNode,
} from '../hierarchy-select';

@Component({
  selector: 'cx-cart-details',
  templateUrl: './cart-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDetailsComponent implements OnInit {
  cart$: Observable<Cart>;
  entries$: Observable<OrderEntry[]>;
  cartLoaded$: Observable<boolean>;
  loggedIn = false;
  promotionLocation: PromotionLocation = PromotionLocation.ActiveCart;
  selectiveCartEnabled: boolean;

  // entryGroups$: Observable<EntryGroup[]>;
  bundleHierarchy: CollapsibleSelectionNode = new CollapsibleSelectionNode(
    'ROOT',
    { children: [] }
  );
  // statusDivisionFilterDataManager: SimpleFilterManager = new SimpleFilterManager();
  entryGroups$: Observable<EntryGroup[]>;
  bundles$: Observable<EntryGroup[]>;

  constructor(
    protected activeCartService: ActiveCartFacade,
    protected selectiveCartService: SelectiveCartFacade,
    protected authService: AuthService,
    protected routingService: RoutingService,
    protected cartConfig: CartConfigService
  ) {}

  ngOnInit() {
    this.cart$ = this.activeCartService.getActive();

    this.entries$ = this.activeCartService
      .getEntries()
      .pipe(filter((entries) => entries.length > 0));

    this.entryGroups$ = this.activeCartService
      .getEntryGroups()
      .pipe(filter((groups) => groups.length > 0));

    this.bundles$ = this.entryGroups$.pipe(
      map((entryGroups) =>
        entryGroups
          .filter((group) => Boolean(group.entryGroups?.length))
          .filter((group) => group.type === 'CONFIGURABLEBUNDLE')
      ),
      tap((entryGroups) =>
        this.prePrareBundleHierarchy(entryGroups, this.bundleHierarchy)
      )
    );

    this.selectiveCartEnabled = this.cartConfig.isSelectiveCartEnabled();

    this.cartLoaded$ = combineLatest([
      this.activeCartService.isStable(),
      this.selectiveCartEnabled
        ? this.selectiveCartService.isStable()
        : of(false),
      this.authService.isUserLoggedIn(),
    ]).pipe(
      tap(([, , loggedIn]) => (this.loggedIn = loggedIn)),
      map(([cartLoaded, sflLoaded, loggedIn]) =>
        loggedIn && this.selectiveCartEnabled
          ? cartLoaded && sflLoaded
          : cartLoaded
      )
    );
  }

  onTagsChecked(checked: Array<SelectionNode<any>>): void {
    const _tags = checked.map((tag) => tag.value);
    console.log('onTagsChecked', _tags);

    // this.filterManager.handleChange({
    // 	filterType: 'tags',
    // 	value: tags,
    // });
  }

  prePrareBundleHierarchy(nodes: EntryGroup[], parent: HierarchyNode): void {
    let treeNode: HierarchyNode<any, any>;
    nodes.forEach((node) => {
      treeNode = new CollapsibleNode(node.label, {
        children: [],
        value: node,
      });
      parent.children.push(treeNode);
      node.entryGroups && node.entryGroups.length > 0
        ? this.prePrareBundleHierarchy(node.entryGroups, treeNode)
        : [];
    });

    // nodes.forEach((node) => {
    //   treeNode = new CollapsibleSelectionNode(node.label, {
    //     children: [],
    //     value: node.entryGroupNumber,
    //   });
    //   parent.children.push(treeNode);
    //   node.entryGroups && node.entryGroups.length>0 ? this.prePrareBundleHierarchy(node.entryGroups, treeNode):[];
    // });
    // return parent.children;
  }

  // addNodeToTree(root: HierarchyNode, entryGroups: Array<any>): void {
  //   // root.children.push(new TitleNode(node.label, { children: []}));

  //   for (let i = 0; i < entryGroups.length; i++) {
  //     const node = entryGroups[i];
  //     if (node.parentId === root.value) {
  //       root.children.push(
  //         new CollapsibleSelectionNode(node.name, {
  //           fullRowSelect: singleSelect,
  //           value: node.id,
  //           children: [],
  //           parent: root,
  //         })
  //       );
  //     }
  //   }
  //   for (const node of root.children) {
  //     addNodeToTree(node, nodes, singleSelect);
  //   }

  // }

  saveForLater(item: OrderEntry) {
    if (this.loggedIn) {
      this.activeCartService.removeEntry(item);
      this.selectiveCartService.addEntry(
        item.product?.code ?? '',
        item.quantity ?? 0
      );
    } else {
      this.routingService.go({ cxRoute: 'login' });
    }
  }
}
