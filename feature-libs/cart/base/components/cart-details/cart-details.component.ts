/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CartConfigService } from '@spartacus/cart/base/core';
import {
  ActiveCartFacade,
  Cart,
  CartOutlets,
  OrderEntry,
  OrderEntryGroup,
  PromotionLocation,
  SelectiveCartFacade,
} from '@spartacus/cart/base/root';
import { CollapsibleNode, HierarchyNode, TitleNode} from '@spartacus/storefront';
import { AuthService, RoutingService } from '@spartacus/core';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

@Component({
  selector: 'cx-cart-details',
  templateUrl: './cart-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDetailsComponent implements OnInit {
  cart$: Observable<Cart>;
  entries$: Observable<OrderEntry[]>;
  standaloneEntries$: Observable<OrderEntry[]>;
  cartLoaded$: Observable<boolean>;
  loggedIn = false;
  promotionLocation: PromotionLocation = PromotionLocation.ActiveCart;
  selectiveCartEnabled: boolean;
  // bundles$: Observable<CollapsibleNode[]>;
  bundles$: Observable<HierarchyNode[]>;

  // entryGroups$: Observable<OrderEntryGroup[]>;
  readonly cartOutlets = CartOutlets;

  constructor(
    protected activeCartService: ActiveCartFacade,
    protected selectiveCartService: SelectiveCartFacade,
    protected authService: AuthService,
    protected routingService: RoutingService,
    protected cartConfig: CartConfigService
  ) {}

  ngOnInit() {
    this.cart$ = this.activeCartService.getActive();

    // this.entries$ = this.activeCartService
    //   .getEntries()
    //   .pipe(filter((entries) => entries.length > 0));

    this.standaloneEntries$ = this.activeCartService
      .getStandaloneEntries()
      .pipe(filter((entries) => entries.length > 0));

    this.bundles$ = this.activeCartService.getBundleEntryGroups().pipe(
      filter((groups) => groups.length > 0),
      map((entryGroups) =>
        entryGroups.map((entryGroup) => {
          const root = new CollapsibleNode('ROOT', {
            children: [],
          });
          this.prepareBundle([entryGroup], root);
          return root;
        })
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

  prepareBundle(
    nodes: OrderEntryGroup[],
    parent: HierarchyNode,
    count: number = 0
  ): void {
    let treeNode: HierarchyNode<any, any>;
    nodes.forEach((node) => {
      if (count === 0) {
        treeNode = new TitleNode(node.label, {
          children: [],
          value: node,
        });

        parent.children.push(treeNode);
        treeNode = parent;
      } else {
        treeNode = new CollapsibleNode(node.label, {
          children: [],
          value: node,
          open: true,
        });
        parent.children.push(treeNode);
      }
      count++;
      node.entryGroups && node.entryGroups.length > 0
        ? this.prepareBundle(node.entryGroups, treeNode, count)
        : [];
    });
  }

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
