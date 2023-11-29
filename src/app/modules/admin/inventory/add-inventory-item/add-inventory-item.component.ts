import { Component,  Inject,  Input,  OnDestroy,  OnInit, Optional, } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { InventoryLocationsService, IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { InventoryAssignmentService, IInventoryAssignment, Serial } from 'src/app/_services/inventory/inventory-assignment.service';
import { ISite } from 'src/app/_interfaces/site';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FbInventoryService } from 'src/app/_form-builder/fb-inventory.service';
import { MenuService, OrdersService } from 'src/app/_services';
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
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';

@Component({
  selector: 'app-add-inventory-item',
  templateUrl: './add-inventory-item.component.html',
  styleUrls: ['./add-inventory-item.component.scss']
})
export class AddInventoryItemComponent implements OnInit, OnDestroy    {

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

  initSubscriptions() {
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
    private _snackBar           : MatSnackBar,
    private uiSettingsService: UISettingsService,
    private siteService         : SitesService,
    public  route               : ActivatedRoute,
    private menuService         : MenuService,
    private fbInventory         : FbInventoryService,
    public fbProductsService    : FbProductsService,
    private inventoryAssignmentService: InventoryAssignmentService,
    private inventoryLocationsService: InventoryLocationsService,
    private scaleService        : ScaleService,
    private dialog              : MatDialog,
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

    // console.log('data', data)

    if (data.buyEnabled) {
      this.buyEnabled = true;
    }

    if (this.item && this.menuItem) {
      // console.log('item', this.item);
      // console.log('menuItem', this.menuItem)

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
        console.log('menuItem', data)
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
    this.itemType$ = this.itemtypeService.getItemType(site, this.item.itemTypeID);
    this.inputForm = this.fbInventory.initForm(this.inputForm)
    this.inputForm = this.fbInventory.intitFormData(this.inputForm, data)


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
        let item = this.inventoryAssignmentService.setItemValues(this.inputForm, this.item)
        if (this.id != 0) {
          return this.inventoryAssignmentService.editInventory(this.site,this.item.id, item)
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
    item$.subscribe(data => {
      this.notifySave(data)
      this.item = data;

      const site = this.siteService.getAssignedSite();
      this.setFormInventoryData(site, this.item)

      if (exit) {
        this.onCancel(true, true)
      }
      return
    })
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
    this.menuService.getMenuItemByID(this.site, id).subscribe(data => {
        console.log('set menu item', data, data.itemType)
        this.menuItem = data
        this.setMenuItem(data, this.item)
     }
    )
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
    this._snackBar.open(message, action, {
      duration: 1000,
      verticalPosition: 'top'
    });
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

    const order = this.orderMethodsService.order;
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
    const order = this.orderMethodsService.order;
    if (!order) { return of(null) };
    return this.printingService.printBuyLabel(this.item, this.menuItem,
                                                          order).pipe(switchMap(data => {
      console.log('printing')
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

}


// .pipe(switchMap(data => {
//   return of(data)
// }))
