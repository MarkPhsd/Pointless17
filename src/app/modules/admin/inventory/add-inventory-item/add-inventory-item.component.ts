import { Component,  Inject,  Input,  OnInit, Optional, } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { InventoryLocationsService, IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { InventoryAssignmentService, IInventoryAssignment, Serial } from 'src/app/_services/inventory/inventory-assignment.service';
import { ISite } from 'src/app/_interfaces/site';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup } from '@angular/forms';
import { FbInventoryService } from 'src/app/_form-builder/fb-inventory.service';
import { MenuService } from 'src/app/_services';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';

@Component({
  selector: 'app-add-inventory-item',
  templateUrl: './add-inventory-item.component.html',
  styleUrls: ['./add-inventory-item.component.scss']
})
export class AddInventoryItemComponent implements OnInit {

  inputForm:                 FormGroup;
  id:                        any;
  site:                      ISite;
  item:                      IInventoryAssignment;
  searchForm:                FormGroup;
  quantityMoving:            number;
  inventoryLocation:         IInventoryLocation;

  inventoryAssignment$:      Observable<IInventoryAssignment>;
  inventoryAssignments  :    IInventoryAssignment[];
  inventoryLocations:        IInventoryLocation[];
  locations$               : Observable<IInventoryLocation[]>;
  inventoryLocations$  :     Observable<IInventoryLocation[]>;

  inventoryLocationID:       number;
  facilityLicenseNumber:     string;
  menuItem:                  IMenuItem;
  facility:                  any;
  productName               = "";

  constructor(
    private _snackBar: MatSnackBar,
    private siteService: SitesService,
    public  route: ActivatedRoute,
    private menuService: MenuService,
    private fbInventory: FbInventoryService,
    private inventoryAssignmentService: InventoryAssignmentService,
    private inventoryLocationsService: InventoryLocationsService,
    private dialogRef: MatDialogRef<AddInventoryItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {

    if (data) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }
    this.item = {} as IInventoryAssignment
  }

  ngOnInit() {
    try {
      this.locations$ = this.inventoryLocationsService.getLocations();
      this.inventoryLocations$ = this.locations$;
      this.site =  this.siteService.getAssignedSite();
      this.inputForm = this.fbInventory.initForm(this.inputForm)

      if (this.id !=0) {
        this.inventoryAssignment$ = this.inventoryAssignmentService.getInventoryAssignment(this.site, this.id)
        this.inventoryAssignment$.subscribe( data=> {
          this.item = data
          this.inputForm = this.fbInventory.initForm(this.inputForm)
          this.inputForm = this.fbInventory.intitFormData(this.inputForm, data)
          this.productName = this.item.productName
        })
      }

      this.locations$.subscribe(data => {
        this.inventoryLocations = data;
      })
    } catch (error) {
      console.log(error)
    }
  }



  async updateItem(event) {

    if (this.inputForm) {
      if (this.inputForm.valid) {

        const packageQuantity = this.inputForm.controls['packageQuantity'].value
        const baseQuantity = { baseQuantity: packageQuantity}

        this.inputForm.patchValue(baseQuantity)

        if (this.id != 0) {
          let item = this.inventoryAssignmentService.setItemValues(this.inputForm, this.item)
          const item$ = this.inventoryAssignmentService.editInventory(this.site,this.item.id, item)
          this.updateInventory(item$)
        }

        if (this.id == 0) {
          let item = this.inventoryAssignmentService.setItemValues(this.inputForm, this.item)
          const item$ = this.inventoryAssignmentService.addInventoryItem(this.site, this.item)
          this.updateInventory(item$)
        }
      }
    }
  }

  private updateInventory(item$: Observable<IInventoryAssignment>) {

    item$.subscribe(data => {
      this.notifySave(data)
      return
    })

  }

  notifySave(item) {
    if (item) {
      this.notifyEvent('Inventory info updated.', 'Success')
      return
    } console.log('updateitem failed')
    this.notifyEvent('Inventory info not  updated.', 'failed')
    return  false
  }

  async updateItemExit(event) {
    const result = await this.updateItem(null)
    this.onCancel(true)
  }

  deleteItem(event) {
    const site = this.siteService.getAssignedSite();
    const delete$ = this.inventoryAssignmentService.deleteInventory(site, this.item.id)
    delete$.subscribe(data => {
        this.notifyEvent('Item Deleted. ', 'Success')
        return
      }, catchError => {
        this.notifyEvent('Item did not delete. ', 'Failed')
        return
      }
    )
  }

  getItem(event) {
    const item = event
    if (item) {
      if (item.id) {
        this.menuService.getMenuItemByID(this.site, item.id).subscribe(data => {
            this.menuItem = data
            this.item = this.inventoryAssignmentService.assignProductToInventory(data, item)
            this.item = this.inventoryAssignmentService.assignChemicals(data, item)
            this.inputForm = this.fbInventory.intitFormData(this.inputForm, item)
          }
        )
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

  getLocationAssignment(id): IInventoryLocation {
    const item =  this.inventoryLocations.find(data => id == data.id  )
    if (item) {
      this.inputForm.patchValue({locationID: item.id, location: item.name})
      return item
    }
    return null
  }

  onCancel(event) {
    this.dialogRef.close(event);
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
      verticalPosition: 'top'
    });
  }

}
