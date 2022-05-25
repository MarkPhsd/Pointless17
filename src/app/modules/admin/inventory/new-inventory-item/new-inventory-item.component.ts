import { Component,  Inject,  OnInit, } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { InventoryLocationsService, IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { InventoryAssignmentService, IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { ISite } from 'src/app/_interfaces/site';
import { ActivatedRoute } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FbInventoryService } from 'src/app/_form-builder/fb-inventory.service';
import { MenuService } from 'src/app/_services/menu/menu.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-new-inventory-item',
  templateUrl: './new-inventory-item.component.html',
  styleUrls: ['./new-inventory-item.component.scss']
})

export class NewInventoryItemComponent implements OnInit {

  inputForm:                 FormGroup;
  id:                        any;
  site:                      ISite;
  item:                      IInventoryAssignment;
  inventoryLocations:        IInventoryLocation[];
  inventoryAssignment$:      Observable<IInventoryAssignment>;
  searchForm:                FormGroup;
  quantityMoving:            number;
  metrcLocations$:           Observable<IInventoryLocation[]>;
  inventoryLocation:         IInventoryLocation;
  inventoryLocationID:       number;
  menuItem                   :IMenuItem;

  constructor(
    private _snackBar    : MatSnackBar,
    private siteService  : SitesService,
    public  route        : ActivatedRoute,
    private fb           : FormBuilder,
    private fbInventory  : FbInventoryService,
    private inventoryAssignmentService: InventoryAssignmentService,
    private menuService  : MenuService,
    private inventoryLocationsService: InventoryLocationsService,
    private dialogRef    : MatDialogRef<NewInventoryItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    if (data) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }

  ngOnInit() {
    this.metrcLocations$ = this.inventoryLocationsService.getLocations();
    this.site =  this.siteService.getAssignedSite();
    this.inventoryAssignment$ = this.inventoryAssignmentService.getInventoryAssignment(this.site, this.id)
    this.inventoryAssignment$.pipe(
      switchMap( data => {
        this.item      = data
        this.inputForm = this.fbInventory.initForm(this.inputForm)
        this.inputForm = this.fbInventory.intitFormData(this.inputForm, data)
        return  this.menuService.getMenuItemByID(this.site, data.productID)
      }
    )).subscribe(data => {
      this.menuItem = data;
    })
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
    if (!this.item) {
      this.notifyEvent('error no item', 'result')
      return
    }
    return this.inventoryAssignmentService.editInventory(this.site,this.item.id, this.item)
  }

  updateItemExit(event) {
    const item$ = this.updateWithoutNotification()
    item$.subscribe(data => {
      if (data) {
        this.onCancel('true')
      }
    })
  }

  deleteItem(event) {
    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }
    const site = this.siteService.getAssignedSite();
    const delete$ = this.inventoryAssignmentService.deleteInventory(site, this.item.id)
    delete$.subscribe(
      {
        next: data => {
          this.notifyEvent('Item Deleted. ', 'Success')
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


}
