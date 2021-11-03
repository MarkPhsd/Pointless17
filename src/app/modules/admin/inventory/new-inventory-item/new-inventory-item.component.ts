import { Component,  Inject,  Input,  OnInit, Optional, } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { InventoryLocationsService, IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { InventoryAssignmentService, IInventoryAssignment, Serial } from 'src/app/_services/inventory/inventory-assignment.service';
import { ISite } from 'src/app/_interfaces/site';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FbInventoryService } from 'src/app/_form-builder/fb-inventory.service';

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

  constructor(
    private _snackBar: MatSnackBar,
    private siteService: SitesService,
    public  route: ActivatedRoute,
    private fb: FormBuilder,
    private fbInventory: FbInventoryService,
    private inventoryAssignmentService: InventoryAssignmentService,
    private inventoryLocationsService: InventoryLocationsService,
    private dialogRef: MatDialogRef<NewInventoryItemComponent>,
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
    this.inventoryAssignment$.subscribe( data=> {
      this.item = data
      this.inputForm = this.fbInventory.initForm(this.inputForm)
      this.inputForm = this.fbInventory.intitFormData(this.inputForm, data)
    })

  }

  async updateItem(event): Promise<boolean> {
    console.log('updateitem')
    this.item   = this.fbInventory.setItemValues(this.item, this.inputForm)
    const item$ = this.inventoryAssignmentService.editInventory(this.site,this.item.id, this.item)
    const item  = await item$.pipe().toPromise()

    if (item) {
      this.notifyEvent('Inventory info updated.', 'Success')
      return true
    }

    console.log('updateitem failed')
    this.notifyEvent('Inventory info not  updated.', 'failed')
    return  false

  }

  async updateItemExit(event) {
    const result = await this.updateItem(null)
    console.log('result', result)
    if (result) {
      this.onCancel(event)
    }
  }

  deleteItem(event) {
    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }

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

    // this.notifyEvent('Not implemented. Please disable item from sales', 'Failed')
  }

  onCancel(event) {
    this.dialogRef.close();
  }


  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }


}
