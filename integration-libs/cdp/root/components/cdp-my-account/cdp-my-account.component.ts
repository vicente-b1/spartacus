import {  Component, OnDestroy,  OnInit,  Optional } from '@angular/core';
import { CxDatePipe, FeatureConfigService, isNotUndefined, OccEndpointsService, RoutingService, TranslationService, UserIdService} from '@spartacus/core';
import { OrderHistoryFacade, ReplenishmentOrderHistoryFacade, OrderHistoryList, Order } from '@spartacus/order/root';
import { Observable, combineLatest } from 'rxjs';
import { tap, map, filter, take, switchMap } from 'rxjs/operators';

@Component({
  selector: 'cx-cdp-body',
  templateUrl: './cdp-my-account.component.html',
  styleUrls: ['./cdp-my-account.component.scss'],
  providers: [CxDatePipe],
})

export class CdpMyAccountComponent implements OnDestroy,OnInit {
  // TODO(#630): make featureConfigService are required dependency and for major releases, remove featureConfigService
  constructor(
    routing: RoutingService,
    orderHistoryFacade: OrderHistoryFacade,
    translation: TranslationService,
    replenishmentOrderHistoryFacade: ReplenishmentOrderHistoryFacade,
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    featureConfigService: FeatureConfigService,
    userIdService: UserIdService
  );
  /**
   * @deprecated since 5.1
   */
  constructor(
    routing: RoutingService,
    orderHistoryFacade: OrderHistoryFacade,
    translation: TranslationService,
    replenishmentOrderHistoryFacade: ReplenishmentOrderHistoryFacade
  );
  constructor(
    protected routing: RoutingService,
    protected orderHistoryFacade: OrderHistoryFacade,
    protected translation: TranslationService,
    protected replenishmentOrderHistoryFacade: ReplenishmentOrderHistoryFacade,
    @Optional() protected featureConfigService?: FeatureConfigService
  );
  
  constructor(private userIdService: UserIdService,
              private cdpOrderAdapter: cdpOrderAdapter,
              protected datePipe: CxDatePipe,
              protected routing: RoutingService,
              protected occEndpointsService: OccEndpointsService){}

  private PAGE_SIZE = 3;
  sortType: string;
  hasPONumber: boolean | undefined;

  orders$: Observable<OrderHistoryList | undefined> = this.orderHistoryFacade
    .getOrderHistoryList(this.PAGE_SIZE)
    .pipe(
      tap((orders: OrderHistoryList | undefined) => {
        if (orders?.pagination?.sort) {
          this.sortType = orders.pagination.sort;
        }
        // TODO(#630): remove featureConfigService for major releases
        this.hasPONumber =
          orders?.orders?.[0]?.purchaseOrderNumber !== undefined &&
          this.featureConfigService?.isLevel('5.1');
      })
    );
 
    ngOnInit(): void {
      this.getMyData(this.orders$);
    }

    public getMyData(): Order{

      const obser= this.userIdService.takeUserId().pipe(switchMap((userId) => this.cdpOrderAdapter.getOrder(userId)));
   
      obser.subscribe(res => {
       this.result=res;
       this.tabTitleParam$.next(res.orders.length);
       this.calculateTotalAmount(this.result);
       this.getItemCount(this.result);
     });
     }
  hasReplenishmentOrder$: Observable<boolean> =
    this.replenishmentOrderHistoryFacade
      .getReplenishmentOrderDetails()
      .pipe(map((order) => order && Object.keys(order).length !== 0));

  isLoaded$: Observable<boolean> =
    this.orderHistoryFacade.getOrderHistoryListLoaded();

  /**
   * When "Order Return" feature is enabled, this component becomes one tab in
   * TabParagraphContainerComponent. This can be read from TabParagraphContainer.
   */
  tabTitleParam$: Observable<number> = this.orders$.pipe(
    map((order) => order?.pagination?.totalResults),
    filter(isNotUndefined),
    take(1)
  );

  ngOnDestroy(): void {
    this.orderHistoryFacade.clearOrderList();
  }

  changeSortCode(sortCode: string): void {
    const event: { sortCode: string; currentPage: number } = {
      sortCode,
      currentPage: 0,
    };
    this.sortType = sortCode;
    this.fetchOrders(event);
  }

  pageChange(page: number): void {
    const event: { sortCode: string; currentPage: number } = {
      sortCode: this.sortType,
      currentPage: page,
    };
    this.fetchOrders(event);
  }

  goToOrderDetail(order: Order): void {
    this.routing.go({
      cxRoute: 'orderDetails',
      params: order,
    });
  }

  getSortLabels(): Observable<{ byDate: string; byOrderNumber: string }> {
    return combineLatest([
      this.translation.translate('sorting.date'),
      this.translation.translate('sorting.orderNumber'),
    ]).pipe(
      map(([textByDate, textByOrderNumber]) => {
        return {
          byDate: textByDate,
          byOrderNumber: textByOrderNumber,
        };
      })
    );
  }

  private fetchOrders(event: { sortCode: string; currentPage: number }): void {
    this.orderHistoryFacade.loadOrderList(
      this.PAGE_SIZE,
      event.currentPage,
      event.sortCode
    );
  }
}
