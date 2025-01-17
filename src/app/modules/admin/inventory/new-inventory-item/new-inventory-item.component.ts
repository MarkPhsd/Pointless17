import { Component,  Inject,  OnDestroy,  OnInit, } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Observable, Subscription, of } from 'rxjs';
import { InventoryLocationsService, IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { InventoryAssignmentService, IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { ISite } from 'src/app/_interfaces/site';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FbInventoryService } from 'src/app/_form-builder/fb-inventory.service';
import { MenuService } from 'src/app/_services/menu/menu.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import {  switchMap } from 'rxjs/operators';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { ISetting,  PosOrderItem } from 'src/app/_interfaces';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { AuthenticationService } from 'src/app/_services';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { EditButtonsStandardComponent } from 'src/app/shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { InventoryHeaderValuesComponent } from '../inventory-header-values/inventory-header-values.component';
import { ValueFieldsComponent } from '../../products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { ProductSearchSelector2Component } from '../../products/productedit/_product-edit-parts/product-search-selector/product-search-selector.component';
import { ProductSearchSelectorComponent } from 'src/app/shared/widgets/product-search-selector/product-search-selector.component';
import { FacilitySearchSelectorComponent } from 'src/app/shared/widgets/facility-search-selector/facility-search-selector.component';
import { MetaTagChipsComponent } from '../../products/productedit/_product-edit-parts/meta-tag-chips/meta-tag-chips.component';
import { UploaderComponent } from 'src/app/shared/widgets/AmazonServices';
import { PriceCategorySearchComponent } from '../../products/productedit/_product-edit-parts/price-category-search/price-category-search.component';
import { PriceCategorySelectComponent } from '../../products/productedit/_product-edit-parts/price-category-select/price-category-select.component';
import { ChemicalValuesComponent } from '../../products/productedit/_product-edit-parts/chemical-values/chemical-values.component';
import { NgxColorsModule } from 'ngx-colors';

@Component({
  selector: 'app-new-inventory-item',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    EditButtonsStandardComponent,
    InventoryHeaderValuesComponent,ValueFieldsComponent,
    ProductSearchSelectorComponent,
    FacilitySearchSelectorComponent,
    MetaTagChipsComponent,
    UploaderComponent,
    PriceCategorySelectComponent,
    ChemicalValuesComponent,
    NgxColorsModule,
    SharedPipesModule],
  templateUrl: './new-inventory-item.component.html',
  styleUrls: ['./new-inventory-item.component.scss']
})

export class NewInventoryItemComponent implements OnInit , OnDestroy{
  saving                    : boolean;
  inputForm:                 FormGroup;
  id:                        any;
  site:                      ISite;
  item:                      IInventoryAssignment;
  inventoryLocations:        IInventoryLocation[];
  inventoryAssignment$:      Observable<IInventoryAssignment>;
  searchForm:                FormGroup;
  quantityMoving:            number;
  locations$ :               Observable<IInventoryLocation[]>;
  locations:                 IInventoryLocation[];
  inventoryLocation:         IInventoryLocation;
  inventoryLocationID:       number;
  menuItem                   :IMenuItem;
  facilityLicenseNumber:     string;
  facility:                  any;
  images  : string;
  itemTags: string;
  color: string;
  _userAuths: Subscription;
  userAuths: IUserAuth_Properties;

  action$: Observable<any>;
  uiHome: UIHomePageSettings;
  _uiHome: Subscription;
  updatingForm: boolean;
  costTotal: number;
  formCostTotal: UntypedFormGroup;

  getUITransactionsSettings() {
    this._uiHome = this.uiSettingsService.homePageSetting$.subscribe( data => {
      if (data) {
        this.uiHome = data;
      }
    });
  }

  userAuthSubscriber() {
    this._userAuths = this.authenticationService.userAuths$.subscribe(data => {
      if (data) {
        this.userAuths = data;
      }
    })
  }

  constructor(
    private _snackBar    : MatSnackBar,
    private siteService  : SitesService,
    public  route        : ActivatedRoute,
    private fb           : UntypedFormBuilder,
    private uiSettingsService: UISettingsService,
    private fbInventory  : FbInventoryService,
    private authenticationService : AuthenticationService,
    private inventoryAssignmentService: InventoryAssignmentService,
    public fbProductsService    : FbProductsService,
    public printingService: PrintingService,
    private menuService  : MenuService,
    private posOrderItemService: POSOrderItemService,
    private router: Router,
    private inventoryLocationsService: InventoryLocationsService,
    private dialogRef    : MatDialogRef<NewInventoryItemComponent>,
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

  }

  get itemTypeDescription() {
    if (!this.menuItem) { return }
    if (!this.menuItem.itemType) { return }
    if (!this.menuItem?.itemType?.useGroups) { return };
    return this.menuItem?.itemType?.useGroups?.name.toLowerCase();
  }

  get isCannabis() {
    if (!this.menuItem) { return }
    if (!this.menuItem.itemType) { return }
    if (!this.menuItem?.itemType?.useGroups) { return };
    if (this.menuItem?.itemType?.useGroups?.name.toLowerCase() === 'cannabis') {
      return true
    }
    if (this.menuItem?.itemType?.useGroups?.name.toLowerCase() === 'med-cannabis') {
      return true
    }
  }

  ngOnDestroy() {
    if (this._uiHome) { this._uiHome.unsubscribe()}
    if (this._userAuths) { this._userAuths.unsubscribe()}
  }

  ngOnInit() {
    this.locations$ = this.inventoryLocationsService.getLocations().pipe(switchMap(data => {
      this.locations = data;
      return of(data)
    }))
    this.site =  this.siteService.getAssignedSite();

    if (this.item && this.menuItem) {
      this.setFormInventoryData(this.item)
      return;
    }
    this.initFormCost()
    this.inventoryAssignment$ = this.inventoryAssignmentService.getInventoryAssignment(this.site, this.id)
    this.inventoryAssignment$.pipe(
      switchMap( data => {
        this.item = data;
        this.setFormInventoryData(this.item)
        if (!data.productID) { return of(null)}
        return  this.menuService.getMenuItemByID(this.site, data.productID)
      }
    )).subscribe(data => {
      this.menuItem = data;
    })

    this.userAuthSubscriber()
    this.getUITransactionsSettings()

  }
  initFormCost() {
    this.formCostTotal = this.fb.group({
      costTotal: []
    })
  }

  updateCost(event) {
    if (this.costTotal) {
      if (this.item.packageCountRemaining && this.item.packageCountRemaining != 0){
        const value = this.costTotal / this.item.packageCountRemaining
        this.inputForm.patchValue({cost: value})
      }
    }
  }

  setFormInventoryData(data) {
    this.item      = data
    try {
      if (data) {
        this.images    = data?.images;
        this.itemTags  = data.metaTags;
        this.color     = data?.color;
      }
    } catch (error) {

    }
    this.inputForm = this.fbInventory.initForm(this.inputForm)
    this.inputForm = this.fbInventory.intitFormData(this.inputForm, data)
    this.subscribeToFormChanges()
  }

  subscribeToFormChanges() {
    if (this.formCostTotal) {
      this.formCostTotal.valueChanges.subscribe(data => {
        if (!this.updatingForm) {
          this.updatingForm = true; // Set flag to true to indicate programmatic update
          this.setCost();
          this.updatingForm = false; // Reset flag after update
        }
      });
    }

    if (this.inputForm) {
      this.inputForm.valueChanges.subscribe(data => {
        if (!this.updatingForm) {
          this.updatingForm = true; // Set flag to true to indicate programmatic update
          this.getTotalCost();
          this.updatingForm = false; // Reset flag after update
        }
      });
    }
  }

  setCost() {
    if (this.formCostTotal.value.costTotal && this.item.packageQuantity) {
      const value = this.formCostTotal.value.costTotal / this.item.packageQuantity;
      this.inputForm.patchValue({ cost: value });
    }
  }

  getTotalCost() {
    if (this.inputForm.value.cost && this.item.packageQuantity) {
      const value = this.inputForm.value.cost * this.item.packageQuantity;
      this.formCostTotal.patchValue({ costTotal: value });
    }
  }

  setLocation(selection) {
    if (this.locations){
      const item = this.locations.filter( data => { return data.id === selection?.value } )
      if (item && item[0]) {
        this.inputForm.patchValue({location: item[0].name })
      }
    }
  }

  setLocationByItem(item) {
    this.inputForm.patchValue({locationID: item?.id, locationName: item[0].name })
  }

  getItem(event) {
    const product = event
    if (product && this.item) {
      if (product.id) {
        this.menuService.getMenuItemByID(this.site, product?.id).subscribe(data => {
          this.item.productID   = data.id;
          this.item.productName = data.name;
          this.inputForm.patchValue(this.item)
        })
      }
    }
  }

  getVendor(event) {
    const facility = event
    if (facility) {
      this.facilityLicenseNumber = `${facility.displayName} `
      this.facility = event;
    }
  }

  updateItem(event) {
    this.action$ =  this.updateWithoutNotification().pipe(
      switchMap(data => {
        if (data) {
          // this.notifyEvent('Inventory info updated.', 'Success')
        }
        this.notifyEvent('Saved.', 'close')
        return of(data)
      })
    )
  }

  updateWithoutNotification(): Observable<IInventoryAssignment> {

    this.item       = this.fbInventory.setItemValues(this.item, this.inputForm)
    return this._updateWithoutNotification(this.item)
  }

  _updateWithoutNotification(item: IInventoryAssignment) {
    this.saving = true;
    if (!item) {
      this.notifyEvent('error no item', 'result')
      return of(null)
    }
    this.item.color = this.color;
    // console.log('item.color', item.color, this.color)
    let poItem$ = of({} as PosOrderItem )
    const site = this.siteService.getAssignedSite()
    if (this.item.poDetailID && this.item.poDetailID != 0) {
      poItem$ = this.posOrderItemService.getPOSOrderItem(site, this.item.poDetailID)
    }

    return this.inventoryAssignmentService.editInventory(this.site, item?.id, item).pipe(switchMap(data => {
      if (data) {
        this.item = data;
        let posItem = {} as PosOrderItem;
        if (!this.item?.cost) {   this.item.cost = 0  }

        if (+item.poDetailID != 0) {
          posItem.id = item.poDetailID
          posItem.inventoryAssignmentID = data.id;
          posItem.wholeSale = this.item?.cost;
          posItem.wholeSaleCost = this.item?.cost;
          return this.posOrderItemService.changeItemCost(site, posItem )
        }
      }
      return of(data)
    })).pipe(switchMap(data => {
      this.saving = false
      return of(this.item)
    }))
  }

  updateItemExit(event) {
    const item$ = this.updateWithoutNotification()
    item$.subscribe(data => {
      if (data) {
        setTimeout(() => {
          this.onCancel('true')
        }, 200);
      }
    })
  }

  setItemTags(event) {
    this.item.metaTags  = event;
    this.inputForm.patchValue({metaTags: event})
  }

  deleteItem(event) {
    const site = this.siteService.getAssignedSite();
    const delete$ = this.inventoryAssignmentService.deleteInventory(site, this.item.id)
    delete$.subscribe(
      {
        next: data => {
          if (data.errorMessage) {
            this.notifyEvent(data?.errorMessage, 'Success')
            return
          }
          if (data.id) {
            this.notifyEvent('Item Deleted. ', 'Success')
            return
          }

          this.notifyEvent(JSON.stringify(data), 'Result')
          return
        },
        error: catchError => {
          this.notifyEvent('Item did not delete. ', 'Failed')
          return
        }
      }
    )
  }

  onCancel(event) {

    this.dialogRef.close(event);
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  received_Image(event) {
    this.images = event
    this.inputForm.patchValue({images: event})
    this.inventoryAssignment$ = this.updateWithoutNotification()
  };

  getLabelSetting(labelSetting: ISetting)  {
    const id = this.menuItem.itemType.labelTypeID
    this.setLastlabelUsed(id)
  }

  setLastlabelUsed(id: number) {
    this.printingService.setLastLabelUsed(id)
  }

  publishItem(item: IInventoryAssignment) {
    if (this.item.id) {
      this.router.navigate(['ebay-publish-product', {id:this.item.id}])
      try {
        this.dialogRef.close()
      } catch (error) {

      }
    }
  }

}
