import { Component,  Inject,  Input,  OnDestroy,  OnInit, Optional, } from '@angular/core';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { InventoryLocationsService, IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { InventoryAssignmentService, IInventoryAssignment,  } from 'src/app/_services/inventory/inventory-assignment.service';
import { ISite } from 'src/app/_interfaces/site';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FbInventoryService } from 'src/app/_form-builder/fb-inventory.service';
import { AuthenticationService, MenuService, OrdersService } from 'src/app/_services';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ScaleInfo, ScaleService, ScaleSetup } from 'src/app/_services/system/scale-service.service';
import { NewInventoryItemComponent } from '../new-inventory-item/new-inventory-item.component';
import { ItemType } from 'src/app/_interfaces/menu/price-schedule';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IPOSOrder, ISetting, PosOrderItem } from 'src/app/_interfaces';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { EditButtonsStandardComponent } from 'src/app/shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { ValueFieldsComponent } from '../../products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { ProductSearchSelector2Component } from '../../products/productedit/_product-edit-parts/product-search-selector/product-search-selector.component';
import { PriceCategorySelectComponent } from '../../products/productedit/_product-edit-parts/price-category-select/price-category-select.component';
import { LabelViewSelectorComponent } from 'src/app/shared-ui/printing/label-view-selector/label-view-selector.component';
import { MetaTagChipsComponent } from '../../products/productedit/_product-edit-parts/meta-tag-chips/meta-tag-chips.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ProductSearchSelectorComponent } from 'src/app/shared/widgets/product-search-selector/product-search-selector.component';
import { FacilitySearchSelectorComponent } from 'src/app/shared/widgets/facility-search-selector/facility-search-selector.component';
import { UploaderComponent } from 'src/app/shared/widgets/AmazonServices';

@Component({
  selector: 'app-add-inventory-item',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
            EditButtonsStandardComponent,ValueFieldsComponent,
            ProductSearchSelector2Component, PriceCategorySelectComponent,
            LabelViewSelectorComponent,
            MetaTagChipsComponent,NgxJsonViewerModule,
            ProductSearchSelectorComponent,
            FacilitySearchSelectorComponent,UploaderComponent,
            SharedPipesModule],
  templateUrl: './add-inventory-item.component.html',
  styleUrls: ['./add-inventory-item.component.scss']
})
export class AddInventoryItemComponent implements OnInit, OnDestroy    {

  update$: Observable<any>;
  images: string;
  inputForm:                 UntypedFormGroup;
  id:                        any;
  site:                      ISite;

  inventoryAssignment$  : Observable<IInventoryAssignment>;
  item:                      IInventoryAssignment;
  searchForm:                UntypedFormGroup;
  quantityMoving:            number;
  inventoryLocation:         IInventoryLocation;
  itemType: ItemType;
  itemType$:Observable<ItemType>;

  scaleName           :   any;
  scaleValue          :   any;

  scaleInfo           : ScaleInfo;
  _scaleInfo          : Subscription;
  scaleSetup          : ScaleSetup;
  displayWeight       : string;
  buyEnabled: boolean;

  itemTags: string;

  action$: Observable<any>;
  inventoryAssignments  : IInventoryAssignment[];
  inventoryLocations    : IInventoryLocation[];
  // locations$            : Observable<IInventoryLocation[]>;
  inventoryLocations$   : Observable<IInventoryLocation[]>;
  labelSetting: ISetting;
  inventoryLocationID:       number;
  facilityLicenseNumber:     string;
  facility:                  any;
  menuItem:                  IMenuItem;
  productName               = "";

  addItem$: Observable<any>;
  _posDevice        : Subscription;
  posDevice       :  ITerminalSettings;
  printLabel$: Observable<any>;

  _userAuths: Subscription;
  userAuths: IUserAuth_Properties;

  uiHome: UIHomePageSettings;
  _uiHome: Subscription;

  userAuthSubscriber() {
    this._userAuths = this.authenticationService.userAuths$.subscribe(data => {
      if (data) {
        this.userAuths = data;
      }
    })
  }

  getUITransactionsSettings() {
    this._uiHome = this.uiSettings.homePageSetting$.subscribe( data => {
      if (data) {
        this.uiHome = data;
      }
    });
  }

  initSubscriptions() {
    this.userAuthSubscriber()
    this.getUITransactionsSettings()
    this._scaleInfo = this.scaleService.scaleInfo$.subscribe( data => {
      this.scaleInfo = data
    })
    try {
      this._posDevice = this.uiSettingsService.posDevice$.subscribe(data => {
        this.posDevice = data;
      })
    } catch (error) {
    }
  }

  constructor(
    private authenticationService: AuthenticationService,
    private uiSettingsService: UISettingsService,
    private siteService         : SitesService,
    public  route               : ActivatedRoute,
    private router              : Router,
    private menuService         : MenuService,
    private fbInventory         : FbInventoryService,
    public  fbProductsService    : FbProductsService,
    private inventoryAssignmentService: InventoryAssignmentService,
    private inventoryLocationsService: InventoryLocationsService,
    private scaleService        : ScaleService,
    private dialog              : MatDialog,
    public  uiSettings             : UISettingsService,
    private fb                  : UntypedFormBuilder,
    private itemtypeService     : ItemTypeService,
    private orderMethodsService : OrderMethodsService,
    private orderService: OrdersService,
    private posOrderItemService: POSOrderItemService,
    private printingService: PrintingService,
    private dateHelper: DateHelperService,
    private dialogRef           : MatDialogRef<AddInventoryItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    if (data) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }

    if (data && data.inventory) {
      this.item = data.inventory;
    }
    if (data && data.menuItem) {
      this.menuItem = data.menuItem;
    }
    if (data.buyEnabled) {
      this.buyEnabled = true;
    }

    if (this.item && this.menuItem) {
      return;
    }

    this.item = {} as IInventoryAssignment;
  }

  ngOnInit() {
    this.initSubscriptions()
    const site = this.siteService.getAssignedSite();
    const locations$ = this.inventoryLocationsService.getLocations()

    this.site =  this.siteService.getAssignedSite();
    this.inputForm = this.fbInventory.initForm(this.inputForm)
    this.initSearchForm();

    this.inventoryLocations$ = locations$.pipe(switchMap(data => {
        this.inventoryLocations = data
        if (this.menuItem && this.item) {
          this.setFormInventoryData(site, this.item)
        }
        return of(data)
      }
    ))


    if (this.id !=0) {
      const inv$ = this.inventoryAssignmentService.getInventoryAssignment(this.site, this.id)
      this.action$ = inv$.pipe(
        switchMap( data => {
          this.item = data
          this.setFormInventoryData(site, data);
          return this.menuService.getMenuItemByID(site, data.productID)
      })).pipe(switchMap(data => {
        this.menuItem = data;
        return locations$
      })).pipe(switchMap(data => {
          this.findDefaultLocationAndSet(data)
          // console.log('locations', data)
          return of(this.menuItem)
        }
      ))
    }
  }

  returnDefaultLocations() {

  }

  findDefaultLocationAndSet(data: IInventoryLocation[]) {
    if (!data) { return;}
    data.forEach(data => {
      if (data.defaultLocation) {
        this.setDefaultLocation(data)
      }
    })
  }

  setDefaultLocation(location: IInventoryLocation) {
    if (location) {
      if (!this.item.location) {
        this.item.location = location.name;
        this.item.locationID = location.id;
        this.inputForm.patchValue({location: location.name, locationID: location.id})
      }
    }
  }

  setFormInventoryData(site: ISite, data) {

    console.log('item found data', data)
    this.itemType$ = this.itemtypeService.getItemType(site, this.item?.itemTypeID);
    this.inputForm = this.fbInventory.initForm(this.inputForm)
    this.inputForm = this.fbInventory.intitFormData(this.inputForm, data)

    this.itemTags = data?.metaTags

    this.productName = this.item.productName
    if (this.menuItem) {
      this.setMenuItem(this.menuItem, this.item)
    }
    this.findDefaultLocationAndSet(this.inventoryLocations)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if( this._scaleInfo) { this._scaleInfo.unsubscribe()}
  }

  initSearchForm() {
    this.searchForm = this.fb.group( {
      productName: []
    })
  }

  applyWeightQuantity() {
    // if (!this.scaleValue || !this.inputForm) {  return }
    const value = { packageQuantity : this.scaleInfo.value};
    this.inputForm.patchValue(value)
  }

  applyQuantity(event) {
    if (!this.scaleValue && this.inputForm && event) {  return }
    const value = { packageQuantity: event};
    this.inputForm.patchValue(value)
  }

  updateItem(event, exit) {
    if (this.inputForm) {
      if (this.inputForm.valid) {
        const packageQuantity = this.inputForm.controls['packageQuantity'].value
        const baseQuantity = { baseQuantity: packageQuantity}
        this.inputForm.patchValue(baseQuantity)
        this.inputForm.patchValue({images: this.images})

        if (this.item && this.item.id) {
          this.id = this.item.id
        }

        if (this.id != 0) {
          let item = this.inventoryAssignmentService.setItemValues(this.inputForm, this.item)
          const item$ = this.inventoryAssignmentService.editInventory(this.site,this.item.id, item)
          this.updateInventory(item$,exit)
        }

        if (this.id == 0) {
          let item = this.inventoryAssignmentService.setItemValues(this.inputForm, this.item)
          const item$ = this.inventoryAssignmentService.addInventoryItem(this.site, this.item)
          this.updateInventory(item$, exit)
        }
      }
    }
  }

  _updateItem() {
    if (this.inputForm) {
      if (this.inputForm.valid) {
        const packageQuantity = this.inputForm.controls['packageQuantity'].value
        const baseQuantity = { baseQuantity: packageQuantity}
        this.inputForm.patchValue(baseQuantity)
        this.inputForm.patchValue({images: this.images})

        let item = this.inventoryAssignmentService.setItemValues(this.inputForm, this.item)
        item.images = this.images;

        if (this.id != 0) {
          return this.inventoryAssignmentService.editInventory(this.site, this.item.id, item)
        }
        if (this.id == 0) {
          return  this.inventoryAssignmentService.addInventoryItem(this.site, item)
        }
      }
    }
    console.log('no item updated')
    return of(null)
  }

  private updateInventory(item$: Observable<IInventoryAssignment>, exit: boolean) {
     const site = this.siteService.getAssignedSite();
    this.update$ = item$.pipe(
      switchMap(data => {
          this.notifySave(data)
          this.item = data;

          this.setFormInventoryData(site, this.item)
          console.log('menuItem', this.menuItem.urlImageMain, this.menuItem.urlImageOther, data.images, this.images)
          if (this.menuItem && !this.menuItem.urlImageMain && data.images) {
            this.menuItem.urlImageMain = data.images;
            return  this.menuService.getProduct(site, this.menuItem.id)
          }

          return of(null)

        }
    )).pipe(
      switchMap(data => {

      if (exit) {
        this.onCancel(true, true)
      }

      if (!data) {
        return of(null)
      }

      if (data && !data.urlImageMain) {
        data.urlImageMain = this.images;
        return this.menuService.saveProduct(site, data)
      }

      return of(data)
    }))

  }

  notifySave(item) {
    if (item) {
      this.notifyEvent('Inventory info updated.', 'Success')
      return
    }
    this.notifyEvent('Inventory info not  updated.', 'failed')
    return  false
  }

  deleteItem(event) {
    const site = this.siteService.getAssignedSite();
    const delete$ = this.inventoryAssignmentService.deleteInventory(site, this.item.id)
    delete$.subscribe(
      {next: data => {
          this.notifyEvent('Item Deleted. ', 'Success')
          this.dialogRef.close()
          return
        }, error: error => {
          this.notifyEvent(`Item did not delete. ${error}` , 'Failed')
          return
        }
      }
    )
  }

  getItem(event) {
    const item = event
    if (item && item.id) {
      this._getItem(item.id)
    }
  }

  _getItem(id) {
    this.action$ =  this.menuService.getMenuItemByID(this.site, id).pipe(
      switchMap(data => {
        this.menuItem = data;
        this.setMenuItem(this.menuItem, this.item)
        return of(data)
     }
    ))
  }

  setMenuItem(menuItem: IMenuItem, item: IInventoryAssignment) {
    this.item = this.inventoryAssignmentService.assignProductToInventory(menuItem, item)

    this.item = this.inventoryAssignmentService.assignChemicals(menuItem, item)

    this.inputForm = this.fbInventory.intitFormData(this.inputForm, item)

    this.images = item?.images;

    this.initSearchForm();
  }

  getVendor(event) {
    const facility = event
    if (facility) {
      this.facilityLicenseNumber = `${facility.displayName} `
      this.facility = event;
    }
  }

  getLocationAssignment(id): IInventoryLocation {
    if (this.inventoryLocations) {
      const item =  this.inventoryLocations.find(data => id == data.id  )
      if (item) {
        this.inputForm.patchValue( {locationID: item.id, location: item.name })
        return item
      }
      return null
    }
  }

  onCancel(event, openEditor) {
    if (this.item) {
      this.openInventoryDialog(this.item.id)
      this.dialogRef.close(this.item);
      return
    }
    this.dialogRef.close(event);
  }

  notifyEvent(message: string, action: string) {
    this.siteService.notify(message, action,2000)
  }


  setItemTags(event) {
    this.item.metaTags  = event;
    this.inputForm.patchValue({metaTags: event})
  }


   ///move to inventoryAssignemtnService
   openInventoryDialog(id: number) {
    const dialogRef = this.dialog.open(NewInventoryItemComponent,
      { width:        '800px',
        minWidth:     '800px',
        height:       '750px',
        minHeight:    '750px',
        data : {id: id}
      },
    )
  }

  received_Image(event) {
    this.images = event
    if (this.item.images = event)
    console.log(this.images)
    this.inputForm.patchValue({images: event})
  };

  buyItem() {
    // saves inventory item
    // adds inventory item to transaction - but as purchase, not as the inventory item itself.
    // use negative cost as price of item on the transaction.
    // sets item as printed so PO Item does not affect inveentory when order is closed.
    //
    // set up discount that can add more value to order if they convert to store credit.
    // make note that store credit is not equal to cash since they do use a conversion principal.
    //switch order to current order
    const order = this.orderMethodsService.currentOrder;
    if (!order) { return };

    const inventoryUpdate$ = this._updateItem();

    let action$ = inventoryUpdate$.pipe(switchMap(data => {
          this.item = data;
          if (data) {
            return this.scanItemForOrder(order, this.menuItem, data)
          }
          return of(null)
        }
      )
    );

    //then we have to set the price = to the negative value of the cost of the inventory item.
    //we also should ensure buy backs don't charge tax, but that's because buy backs should be
    //using a buy back transaction type.

    let posItem: PosOrderItem
    const site = this.siteService.getAssignedSite();
    this.addItem$ = action$.pipe(switchMap(data => {
      posItem = data.posItem as unknown as PosOrderItem
      posItem.unitPrice = -this.item.cost;
      return this.posOrderItemService.changeItemPrice(site, posItem );

    }))
    .pipe(switchMap(data => {
      console.log('post change data', data)
      return this.posOrderItemService.getPurchaseOrderItem(site, posItem.id )
    }))
    .pipe(switchMap(data => {
      data.inventoryAssignmentID = this.item.id;
      data.serialCode = this.item.sku
      console.log('pre buyItemUpdate', data)
      return this.posOrderItemService.buyItemUpdate(site, data)
     }))
    .pipe(switchMap(data => {
      console.log('post] buyItemUpdate', data)
      if (data && data.errorMessage) {
        this.siteService.notify(`Error occured ${data.errorMessage}`, 'close', 50000, 'red')
        return of(null)
      }
      return this.orderService.getOrder(site, data.orderID.toString(), false)
    }))
    .pipe(switchMap(data => {

      this.orderMethodsService.updateOrder(data)
      return of(data)
    }))
    .pipe(switchMap(data => {
      this.dialogRef.close()
      return of(data)
    }))

  }

  scanItemForOrder(order : IPOSOrder, menuItem: IMenuItem, item: IInventoryAssignment) {

    const site = this.siteService.getAssignedSite();
    if (!order) {
      console.log('no order')
      return;
    }

    if (! menuItem.barcode) {
      console.log('no barcode',  menuItem.barcode)
      return;
    }

    return this.orderMethodsService.scanItemForOrder(site, order, menuItem.barcode, item.packageQuantity,
          null,
          null,
          null,
          null,
          null,
          item.cost).pipe(switchMap(
      data => {
        this.orderMethodsService.processItemPostResultsPipe(data)
        return of(data);
      }
    ))

  }

  printLabel() {
    //default label. - can get from pos settings.
    if (this.posDevice?.labelPrinter) {
      if (this.menuItem && this.menuItem.itemType && this.menuItem.itemType.labelTypeID) {
        this.printLabel$ = this._printLabel()
      }
    }
  }

  _printLabel() {
    //switch order to current order
    const order = this.orderMethodsService.currentOrder;
    if (!order) { return of(null) };
    return this.printingService.printBuyLabel(this.item, this.menuItem,
                                                          order).pipe(switchMap(data => {
      return of (null)
    }))
  }

  getLabelSetting(labelSetting: ISetting)  {
    // this.labelSetting = labelSetting;
    const id = this.menuItem.itemType.labelTypeID
    this.setLastlabelUsed(id)
  }

  setLastlabelUsed(id: number) {
    this.printingService.setLastLabelUsed(id)
  }


  // publishItem(item) {
  //   if (item) {
  //     const site = this.siteService.getAssignedSite()
  //     item.publishItem = true;
  //     this.siteService.notify('Item Published to Ebay', 'Close', 30000, 'green')
  //     this.updateItem(this.item, false);
  //   }
  // }

  publishItem(item: IInventoryAssignment) {
    // if (item) {
    //   const site = this.siteService.getAssignedSite()
    //   item.ebayPublished = true;
    //   this.inputForm.patchValue({ebayPublished: true})
    //   this.action$ = this.updateWithoutNotification().pipe(switchMap(data => {
    //     this.siteService.notify('Item Published to Ebay', 'Close', 30000, 'green')
    //     return of(data)
    //   }))
    // }
    if (this.item.id) {
      this.router.navigate(['ebay-publish-product', {id:this.item.id}])
      try {
        this.dialogRef.close()
      } catch (error) {

      }
    }
  }

}


// .pipe(switchMap(data => {
//   return of(data)
// }))
