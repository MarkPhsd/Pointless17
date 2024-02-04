import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder, IPurchaseOrderItem, PosOrderItem, UnitType } from 'src/app/_interfaces';
import { IMenuItem, menuButtonJSON } from 'src/app/_interfaces/menu/menu-products';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { IItemBasic, IItemBasicValue, MenuService } from 'src/app/_services';
import { IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { InventoryLocationsService } from 'src/app/_services/inventory/inventory-locations.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ItemPostResults, NewItem, POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';

@Component({
  selector: 'new-order-item',
  templateUrl: './new-order-item.component.html',
  styleUrls: ['./new-order-item.component.scss']
})
export class NewOrderItemComponent implements OnInit {

  chipControl = new FormControl(new Set());

  inputForm: FormGroup;
  productSearchForm
  searchForm: FormGroup;
  unitSearchForm: FormGroup;
  indexValue    : number = 1;
  posOrderItem: PosOrderItem;
  action$: Observable<any>;
  product$: Observable<any>;
  menuItemSelected: IMenuItem;
  unitOptions: IItemBasic[]
  menuItem      : IMenuItem;
  @Input()  order: IPOSOrder;
  @Output() outPutRefresh  : EventEmitter<any> = new EventEmitter<any>();
  @Output() saveUpdate  : EventEmitter<any> = new EventEmitter<any>();
  unitType$: Observable<UnitType>
  unitSelected: IItemBasic;
  setChange: boolean;
  baseCaseQTY: IItemBasicValue;
  repOrderUnitType$: Observable<UnitType>
  constructor(private fb: FormBuilder,
              private menuService: MenuService,
              private siteService: SitesService,
              private productEditButtonService: ProductEditButtonService,
              private orderService: OrderMethodsService,
              private unitTypeService: UnitTypesService,
              private posOrderItemSerivce: POSOrderItemService,
              private inventoryAssignmentService: InventoryAssignmentService,
              private inventoryLocationsService: InventoryLocationsService,
              private orderItemService: POSOrderItemService) { }

  ngOnInit(): void {
    this.initInputForm(null);
  }

  get chips() {
    return this.chipControl.value;
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
    this.unitOptions = null;
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
        this.menuItemSelected = data;
        console.log(this.menuItemSelected)
        this.posOrderItem.productID = event.id;
        this.posOrderItem.unitPrice = event.retail;
        this.posOrderItem.wholeSale = event.wholeSale;
        this.posOrderItem.productName = event?.name

        this.inputForm.patchValue(this.posOrderItem);
        this.getItemUnitOptions();
        return of(data)
      }))
    }
  }

  getItemUnitOptions() {
    this.unitOptions = [] as IItemBasic[];
    if (this.menuItemSelected) {
      this.assignExtraUOMS(this.menuItemSelected?.json)
      this.getRegularUnitTypes();
    }
  }

  assignExtraUOMS(items: string) {
    const item = JSON.parse(items) as menuButtonJSON;
    if (item) {
      if (item.unitTypeSelections) {
        const units = JSON.parse(item.unitTypeSelections) as IItemBasic[];
        if (units) {
          this.unitOptions = units;
        }
        if (!units) {  this.unitOptions = [] as IItemBasic[];   }
      }
    }
  }

  getRegularUnitTypes() {
    const site = this.siteService.getAssignedSite()

    this.repOrderUnitType$ = this.menuService.getProduct(site, this.menuItemSelected.id).pipe(
      switchMap(data => {
        if (data && data?.reOrderUnitTypeID) {
          return this.unitTypeService.get(site, data?.reOrderUnitTypeID);
        }
        const item = {} as UnitType
        return of(item)
      })).pipe(switchMap(data => {
        if (data && data.id != 0 ) {
          this.unitOptions.push({name: data?.name, id: data?.id})
        }
        return of(data)
      })
    )
    return;
  }

  assignUnitType(event) {
    console.log('value', event?.value)
  }

  toggleChip = (chip: any) => {
    //keep for reference!
    // const addChip = () => {
    //   this.chips.add(chip);
    // };
    // const removeChip = () => {
    //   this.chips.delete(chip);
    // };
    // this.chips.has(chip) ? removeChip() : addChip();
    // console.log('menuItemSelected', this.menuItemSelected)
    // console.log('posOrderItem', this.posOrderItem.wholeSale)
    // console.log('menuItemSelected', this.menuItemSelected.wholesale)

    const site = this.siteService.getAssignedSite()
    this.unitType$ = this.unitTypeService.get(site, chip?.id).pipe(switchMap(data => {
      this.posOrderItem.unitName = data?.name;
      this.posOrderItem.unitMultiplier = data.unitMultiplyer;
      this.posOrderItem.unitType = data?.id;

      this.posOrderItem.wholeSale = (this.menuItemSelected.wholesale *  data.unitMultiplyer);
      this.inputForm.patchValue({wholeSale: this.posOrderItem.wholeSale})
      this.unitSearchForm.patchValue({unitName: chip?.name, unitTypeID: chip?.id})
      this.setChange = true;

      this.inputForm.patchValue({unitName: data?.name, unitTypeID: data?.id});
      return of(data)
    }))
  };

  updateSetChange(event) {
    this.setChange = false;
  }

  assignItem(event) {
    if (event) {
      const unit  = event;
      // if (this.menuService.getPricesFromProductPrices)
      // if this menuItemSelected exists, then we can set the
      // to a matching product unit price if it exists.
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
      if (!this.menuItemSelected) {
        this.siteService.notify('No item yet selected.', 'close', 6000);
        return;
      }

      this.action$  =  this.setThisItem(this.posOrderItem).pipe(switchMap(data => {
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

    console.log(this.posOrderItem?.wholeSale);
    const posItem = this.inputForm.value;
    this.posOrderItem.quantity = posItem.quantity;

    const cost = this.posOrderItem.wholeSale;
    // console.log('cost', cost)
    newItem.menuItem = this.menuItemSelected;

    newItem.quantity = this.posOrderItem?.quantity;
    newItem.orderID = this.order?.id;
    newItem.barcode = this.menuItem?.barcode;
    newItem.passAlongItem = null;
    newItem.deviceName = localStorage.getItem('devicename');
    newItem.clientID = this.order?.clientID;

    const searchModel = {name: this.posOrderItem.productName } as ProductSearchModel;
    let quantity = +this.inputForm.controls['quantity'].value;

    // if (this.inputForm.controls['quantity'].value) {
    const unitName = this.inputForm.controls['unitName'].value
    const unitTypeID = this.inputForm.controls['unitTypeID'].value
    newItem.menuItem.unitDescription = unitName;
    newItem.menuItem.unitTypeID = unitTypeID;
    newItem.unitTypeID = unitTypeID;

    if (!newItem.menuItem.barcode && !newItem?.menuItem?.itemType?.requireInStock) {
      this.siteService.notify('Item requires barcode, or that the item Type option set to RequireInStock, to be added through purchase orders. Open the catalog, find the item and assign it a barcode.', 'Close',  6000, 'red');
      return of({})
    }

    let item$
    if (newItem.menuItem.barcode) {
      item$ =  this.orderService.addItemToOrderFromBarcode( newItem.menuItem.barcode, null, null,
          quantity,
          unitTypeID, cost)
    } else {
      item$ =  this.orderService.addItemToOrderObs(this.order, this.menuItemSelected, newItem.quantity, null, null, null, unitTypeID )
    }

    return item$.pipe(switchMap(data => {
      this.initInputForm(null)
      const item = data as unknown as  ItemPostResults
      let poItem = {} as PosOrderItem;
      poItem.wholeSale = cost
      poItem.id = item.posItem?.id;
      poItem.orderID = item.posItem.orderID;
      let pItem = item.posItem as IPurchaseOrderItem
      return of(pItem)
    })).pipe(switchMap(data => {
      let item = data as unknown as IPurchaseOrderItem

      if (newItem?.menuItem?.itemType?.requireInStock ) {
        if (this.menuItemSelected) {}
        newItem.menuItem.unitDescription = unitName;
        newItem.menuItem.unitTypeID = unitTypeID;
        newItem.unitTypeID = unitTypeID;

        let inv: IInventoryAssignment;
        return this.postNewInventoryItem(site, newItem?.menuItem, item,  newItem.quantity).pipe(switchMap(data => {
            item.inventoryAssignmentID = data.id;
            this.clearProduct();
            this.clearUnit();
            return of(data)
           }
        ))
        //   inv = data;
        //   return this.posOrderItemSerivce.putItem(site, item)
        // })).pipe(switchMap(data => {
        //   //then save
        //   return of(inv)
        // }))
      }

      this.clearProduct();
      this.clearUnit()
      // console.log('Does not require stock.')
      return of(null)
    }));



  }

  //move to service
  postNewInventoryItem(site, menuItem: IMenuItem, item: IPurchaseOrderItem, quantity: number) {
    //when posting then also call back and save to the item detail itself.
    let inv = {} as IInventoryAssignment;
    inv.poDetailID = item.id;
    inv.employeeID = item.employeeID;

    inv = this.inventoryAssignmentService.assignProductToInventory(menuItem, inv)
    inv = this.inventoryAssignmentService.assignChemicals(menuItem, inv)
    inv.packageQuantity       = quantity
    inv.baseQuantityRemaining = inv?.packageQuantity;
    inv.packageCountRemaining = inv?.packageQuantity;
    inv.baseQuantity          = inv?.packageQuantity;

    inv.unitOfMeasureName     = menuItem.unitDescription //= unitName;
    inv.intakeUOM             = menuItem.unitDescription //= unitTypeID;
    inv.unitMulitplier        = 1;

    const defaultInventory$   = this.inventoryLocationsService.getDefaultLocation().pipe(switchMap(data => {
      if (data) {
        inv.location   = data?.name;
        inv.locationID = data?.id
      }
      return of(data);
    }))

    const postItem$ = this.inventoryAssignmentService.postInventoryAssignment(site, inv, false)

    const item$ = defaultInventory$.pipe(switchMap(data => {
        return postItem$
    }));

    return item$.pipe(switchMap(data => {
      item.inventoryAssignmentID = data.id;
      const invItem =  {id: item.id, inventoryID: data.id};
      const dialogRef = this.inventoryAssignmentService.openInventoryItem(data.id)
      return  this.posOrderItemSerivce.setInventoryId(site, invItem)
    }));
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
