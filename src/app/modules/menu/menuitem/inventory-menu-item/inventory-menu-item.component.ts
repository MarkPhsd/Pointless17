import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subscription, catchError, of, switchMap } from 'rxjs';
import { AWSBucketService } from 'src/app/_services';
import { AvalibleInventoryResults, IInventoryAssignment, InventoryAssignmentService, InventoryFilter, InventorySearchResultsPaged } from 'src/app/_services/inventory/inventory-assignment.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'inventory-menu-item',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './inventory-menu-item.component.html',
  styleUrls: ['./inventory-menu-item.component.scss']
})
export class InventoryMenuItemComponent implements OnInit, OnChanges {

  // @Input() productID: number;
  @Input() productID: number;
  @Input() posDevice:  ITerminalSettings;
  inventoryItems$: Observable<InventorySearchResultsPaged>;
  inventoryList : IInventoryAssignment[];
  addItem$: Observable<any>;
  @Output() outPutInventoryInfo = new EventEmitter();
  @Input() inputInventory: AvalibleInventoryResults;

  @Input() enableSell: boolean;
  @Input() userAuth: IUserAuth_Properties;
  action$: Observable<any>;
  uiHome: UIHomePageSettings;
  _uiHome: Subscription;
  imageList
  awsBucketURL: string;

  getUITransactionsSettings() {
    // console.log('get Settings inventory Item')
    this._uiHome = this.uiSettingsService.homePageSetting$.subscribe( data => {
      if (data) {
        this.uiHome = data;
      }
    });
  }

  constructor(
    private siteService        : SitesService,
    private serviceTypeService : ServiceTypeService,
    private orderMethodService : OrderMethodsService,
    private uiSettingsService: UISettingsService,
    private awsBucket: AWSBucketService,
    private inventoryService   : InventoryAssignmentService) { }

  async ngOnInit() {

    this.awsBucketURL = await this.awsBucket.awsBucketURL()
    // console.log('get ui transaction settings')
    this.getUITransactionsSettings()

    if (this.inputInventory) {
      this.inventoryList = this.inputInventory.results
      return;
    }

    this.getInventoryInfo(this.productID)
  }

  getImages(item) {
    // item.images
    item = item.replace('undefined', '')
    // console.log('images inventory', item )
    const imageLink = this.awsBucket.convertToArrayWithUrl(item, this.awsBucketURL);
    return imageLink;
  }

  ngOnChanges() {
    this.getInventoryInfo(this.productID)
  }

  ngOnDestroy() {
    if (this._uiHome) {this._uiHome.unsubscribe()}
  }

  metaTagRefresh(event){
    console.log('event', event)
  }

  getInventoryInfo(id: number) {
    this.inventoryItems$ == this._getInventoryInfo(id)
  }

  _getInventoryInfo(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite()
      return  this.inventoryService.getAvalibleInventory(site, id, true).pipe(switchMap(data => {
        this.inputInventory = data;
        this.productID = id
        this.inventoryList = data.results
        this.outPutInventoryInfo.emit(data)
        return of(data)
      }),catchError(data => {
        this.siteService.notify(`Error: ${data.toString()}`, 'close', 6000, 'red')
        return of(data)
      }));
    }
    return of(null)
  }

  addNewOrder() {
    const site = this.siteService.getAssignedSite();
    if (this.posDevice) {
      if (this.posDevice.defaultOrderTypeID  && this.posDevice.defaultOrderTypeID != 0) {
        const serviceType$ = this.serviceTypeService.getType(site, this.posDevice.defaultOrderTypeID)
        return serviceType$.pipe(switchMap(data => {
            return of(data)
        })).pipe(switchMap(data => {
            const order$ = this.getNewOrder(site, null)
            return order$
        }))
      }
    }
    return this.getNewOrder(site, null)
  }

  getNewOrder(site, serviceType) {
    const order = this.orderMethodService.order;
    if (order) { return of(order)}
    return this.orderMethodService.newOrderWithPayloadMethod(site, serviceType).pipe(
      switchMap(data => {
        return of(data)
    }))
  }

  publishItem(item) {
    if (item) {
      const site = this.siteService.getAssignedSite()
      item.publishItem = true;
      this.inventoryItems$ = this.inventoryService.putInventoryAssignment(site, item).pipe(switchMap(data => {
        this.siteService.notify('Item published', 'Close', 3000, 'green')
        return of(data)
      }
      )).pipe(switchMap(data => {
        return this._getInventoryInfo(this.productID)
      }))
    }
  }

  addItemToOrder(item: any) {
    const site = this.siteService.getAssignedSite();
    this.addItem$ = this.addNewOrder().pipe(
      switchMap(order => {
        this.orderMethodService.order = order;
        const inv = item as IInventoryAssignment;
        console.log('barcode',item.sku)
        return this.orderMethodService.scanBarcodedItem(site, order, inv.sku, 1, null, null, null, null, null, null);
      }),
      switchMap(data => {
        return of(data);
      }),
      catchError(data => {
        this.siteService.notify(`Error ${data.toString()}`, 'close', 69000, 'red');
        return of(data);
      })
    );
  }

}
