import { Component,  Inject,  OnDestroy,  OnInit, } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable, Subscription, of } from 'rxjs';
import { InventoryLocationsService, IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { InventoryAssignmentService, IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { ISite } from 'src/app/_interfaces/site';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FbInventoryService } from 'src/app/_form-builder/fb-inventory.service';
import { MenuService } from 'src/app/_services/menu/menu.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { catchError, switchMap } from 'rxjs/operators';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { ISetting, IUser } from 'src/app/_interfaces';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { AuthenticationService } from 'src/app/_services';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-new-inventory-item',
  templateUrl: './new-inventory-item.component.html',
  styleUrls: ['./new-inventory-item.component.scss']
})

export class NewInventoryItemComponent implements OnInit , OnDestroy{

  inputForm:                 UntypedFormGroup;
  id:                        any;
  site:                      ISite;
  item:                      IInventoryAssignment;
  inventoryLocations:        IInventoryLocation[];
  inventoryAssignment$:      Observable<IInventoryAssignment>;
  searchForm:                UntypedFormGroup;
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

  _userAuths: Subscription;
  userAuths: IUserAuth_Properties;

  action$: Observable<any>;

  uiHome: UIHomePageSettings;
  _uiHome: Subscription;

  costTotal: number;

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
        // this.
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

    this.inventoryAssignment$ = this.inventoryAssignmentService.getInventoryAssignment(this.site, this.id)
    this.inventoryAssignment$.pipe(
      switchMap( data => {
        this.item = data;
        this.setFormInventoryData(this.item)
        console.log(data.productID)
        if (!data.productID) { return of(null)}
        return  this.menuService.getMenuItemByID(this.site, data.productID)
      }
    )).subscribe(data => {
      // console.log('menu item', data)
      this.menuItem = data;
    })

    this.userAuthSubscriber()
    this.getUITransactionsSettings()

  }

  updateCost(event) {
    console.log('cost total',event, this.costTotal, this.item);
    if (this.costTotal) {
      if (this.item.packageCountRemaining && this.item.packageCountRemaining != 0){
        const value = this.costTotal / this.item.packageCountRemaining
        this.inputForm.controls['cost'].setValue(value)
      }
    }
  }

  setFormInventoryData(data) {
    this.item      = data
    this.images    = data?.images;
    this.itemTags  = data.metaTags;
    this.inputForm = this.fbInventory.initForm(this.inputForm)
    this.inputForm = this.fbInventory.intitFormData(this.inputForm, data)

    this.inputForm.valueChanges.subscribe(data => {

      console.log(data, data.cost);

      const cost = this.inputForm.controls['cost'].value;
      this.costTotal = this.item.packageQuantity * cost

    })
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
        this.menuService.getMenuItemByID(this.site, product.id).subscribe(data => {
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
    const item$ = this.updateWithoutNotification()
    item$.subscribe(data => {
      if (data) {
        this.notifyEvent('Inventory info updated.', 'Success')
        return true
      }
      this.notifyEvent('Inventory info not  updated.', 'failed')
    })
  }

  updateWithoutNotification(): Observable<IInventoryAssignment> {
    this.item   = this.fbInventory.setItemValues(this.item, this.inputForm)
    return this._updateWithoutNotification(this.item)
  }

  _updateWithoutNotification(item: IInventoryAssignment) {
    if (!item) {
      this.notifyEvent('error no item', 'result')
      return of(null)
    }
    return this.inventoryAssignmentService.editInventory(this.site, item.id, item)
  }

  updateItemExit(event) {
    const item$ = this.updateWithoutNotification()
    item$.subscribe(data => {
      if (data) {
        this.onCancel('true')
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
