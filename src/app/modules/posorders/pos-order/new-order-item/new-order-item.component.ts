import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Product } from 'electron/main';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { MenuService, OrdersService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { NewItem, POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';

@Component({
  selector: 'new-order-item',
  templateUrl: './new-order-item.component.html',
  styleUrls: ['./new-order-item.component.scss']
})
export class NewOrderItemComponent implements OnInit {

  inputForm: FormGroup;
  productSearchForm
  searchForm: FormGroup;
  unitSearchForm: FormGroup;
  indexValue    : number = 1;
  posOrderItem: PosOrderItem;
  action$: Observable<any>;
  product$: Observable<any>;
  menuItemSelected: IMenuItem;
  menuItem      : IMenuItem;
  @Input()  order: IPOSOrder;
  @Output() outPutRefresh  : EventEmitter<any> = new EventEmitter<any>();
  @Output() saveUpdate  : EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
              private menuService: MenuService,
              private siteService: SitesService,
              private productEditButtonService: ProductEditButtonService,
              private orderService: OrderMethodsService,
              private orderItemService: POSOrderItemService) { }

  ngOnInit(): void {
    this.initInputForm(null);
  }

  initInputForm(item: PosOrderItem) {
    this.posOrderItem = {} as PosOrderItem;
    this.inputForm = this.fb.group({
      id: [],
      name: [],
      productID: [],
      productName: [],
      unitTypeID:[],
      unitName: [],
      quantity:[1],
      cost:[],
      price:[],
    })

    this.inputForm.patchValue(item);
    this.initUnitSearchForm(item)
    this.initProductSearchForm(item)
  }

  clearInputs(event) {
    this.initInputForm(null)
  }

  initSearchForm() {
    this.searchForm = this.fb.group( {
      productName: []
    })
  }

  edit(item) {
    // this.action$ =  this.partBuilderComponent.save(this.site, item.id).pipe(switchMap(data => {
    //   if (!data || data.toString().toLowerCase() === 'not found') {
    //     this.siteService.notify(' Item not found or updated', 'close', 2000, 'red')
    //   }
    //   return this.updateView()
    // }))
  }

  editItem(item) {
    // if (!item) { return }
    // this.product$ = this.productEditButtonService.openProductDialogObs(item.productID).pipe(switchMap(data => {
    //   const dialog = data
    //   dialog.afterClosed().subscribe(result => {
    //     this.outPutRefresh.emit(true)
    //   })
    //   return of(data)
    // }))
  }

  delete(item) {
    // if (this.pb_Main.pB_Components) {
    //   this.pb_Main.pB_Components = this.pb_Main.pB_Components.filter(data => {return data.id != item.id})
    //   this.action$ = this.partBuilderComponent.deleteComponent(this.site, item.id).pipe(switchMap(data => {
    //     if (!data || data.toString().toLowerCase() === 'not found') {
    //       this.siteService.notify(' Item not found or deleted', 'close', 2000, 'red')
    //     }
    //     return of(data)
    //   }))
    // }
  }

  assignProduct(event) {
    if (this.posOrderItem) {
      //then we want to ensure we get tthe actual product.
      const site = this.siteService.getAssignedSite()
      this.action$ = this.menuService.getMenuItemByID(site, event.id).pipe(switchMap(data => {
        this.posOrderItem.productID = event.id;
        this.posOrderItem.unitPrice = event.retail;
        this.posOrderItem.wholeSale = event.wholeSale;
        this.posOrderItem.productName = event?.name
        this.menuItemSelected = data;
        this.inputForm.patchValue(this.posOrderItem);
        return of(data)
      }))
    }
  }

  assignItem(event) {
    if (event) {
      const unit  = event;
      // if (this.menuService.getPricesFromProductPrices)
      //if this menuItemSelected exists, then we can set the
      //to a matching product unit price if it exists.
      this.inputForm.patchValue({unitName: event?.name, unitTypeID: event?.id});
    }
  }

  getItem(event) {
    // const item = event
    // if (item && item.id) {
    //   this.menuService.getMenuItemByID(this.site, item.id).subscribe(data => {
    //       this.menuItem = data
    //       this.pb_Component.price = data.retail;
    //       this.pb_Component.cost = data.wholeSale;
    //       this.pb_Component.productID = data.id;
    //       this.pb_Component.unitTypeID = data.unitTypeID;
    //       this.pb_Component.name = data.name;
    //       this.pb_Component.quantity = +this.inputForm.controls['quantity'].value;
    //       this.pb_Component.product = this.menuItem;
    //       this.inputForm.patchValue(this.pb_Component);
    //       this.setThisPBComponent(this.pb_Component)
    //       this.initSearchForm();
    //     }
    //   )
    // }
  }

  addItem() {
    if (this.inputForm) {
      this.posOrderItem = this.inputForm.value
      this.action$  =  this.setThisItem(this.posOrderItem).pipe(switchMap(data => {
        this.clearProduct();
        this.clearUnit()
        return of(data)
      }))
    }
  }

  makenewProduct() {
    let diag = this.productEditButtonService.openNewItemSelector()
    // diag.onClose(data => {
    //   console.log('closed', data)
    // })
  }

  setThisItem(item: PosOrderItem) {
    const site = this.siteService.getAssignedSite()
    let newItem : NewItem;
    newItem = {} as NewItem;
    this.posOrderItem = this.inputForm.value as PosOrderItem;

    newItem.menuItem = this.menuItemSelected;
    if (!this.menuItemSelected) {

    }

    newItem.quantity = this.posOrderItem?.quantity;
    newItem.orderID = this.order?.id;
    newItem.barcode = this.menuItem?.barcode;
    newItem.passAlongItem = null;
    newItem.deviceName = localStorage.getItem('devicename');
    newItem.clientID = this.order?.clientID;

    const searchModel = {name: this.posOrderItem.productName } as ProductSearchModel;
    let quantity = +this.inputForm.controls['quantity'].value;

    //unitName: event?.name, unitTypeID: event?.id

    if (this.inputForm.controls['quantity'].value) {
      const unitName = this.inputForm.controls['unitName'].value
      const unitTypeID = this.inputForm.controls['unitTypeID'].value
      newItem.menuItem.unitTypeID = unitTypeID;
    }


    if (!newItem.menuItem.barcode) {
      this.siteService.notify('Item requires barcode to be added through purchase orders. Open the catalog, find the item and assign it a barcode.', 'Close',  6000, 'red');
      return of({})
    }

    return this.orderService.addItemToOrderFromBarcode( newItem.menuItem.barcode, null, null,
                                                        quantity,
                                                        newItem?.menuItem?.unitTypeID).pipe( switchMap (data => {
      this.initInputForm(null)
      return of({})
    }))

  }

  replaceObject(newObj: any, list: any[]): any[] {
    return list.map((obj) => obj.id === newObj.id ? newObj : obj);
  }

  initUnitSearchForm(item: PosOrderItem) {
    if (!item) {
      this.clearUnit()
      return
    }
    this.inputForm.patchValue({ unitTypeID: item?.unitType})
    this.unitSearchForm = this.fb.group({
      searchField: [item?.unitName]
    })
  }

  initProductSearchForm(item: PosOrderItem) {
    if (!item) {
      this.clearUnit();
      return;
    }
    this.inputForm.patchValue({ productID: item?.productID})
    this.productSearchForm = this.fb.group({
      searchField: [item?.productName]
    })
  }

  clearUnit() {
    this.inputForm.patchValue({ unitTypeID: 0})
    this.unitSearchForm = this.fb.group({
      searchField: []
    })
  }

  clearProduct() {
    this.menuItemSelected = null;
    this.inputForm.patchValue({ productID: 0})
    this.productSearchForm = this.fb.group({
      searchField: []
    })
  }



}
