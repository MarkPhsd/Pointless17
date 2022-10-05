import { Component,  Inject,  Input,  OnDestroy,  OnInit, Optional, } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { InventoryLocationsService, IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { InventoryAssignmentService, IInventoryAssignment, Serial } from 'src/app/_services/inventory/inventory-assignment.service';
import { ISite } from 'src/app/_interfaces/site';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FbInventoryService } from 'src/app/_form-builder/fb-inventory.service';
import { MenuService } from 'src/app/_services';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ScaleInfo, ScaleService, ScaleSetup } from 'src/app/_services/system/scale-service.service';
import { NewInventoryItemComponent } from '../new-inventory-item/new-inventory-item.component';

@Component({
  selector: 'app-add-inventory-item',
  templateUrl: './add-inventory-item.component.html',
  styleUrls: ['./add-inventory-item.component.scss']
})
export class AddInventoryItemComponent implements OnInit, OnDestroy    {

  inputForm:                 FormGroup;
  id:                        any;
  site:                      ISite;
  item:                      IInventoryAssignment;
  searchForm:                FormGroup;
  quantityMoving:            number;
  inventoryLocation:         IInventoryLocation;

  scaleName           :   any;
  scaleValue          :   any;

  scaleInfo           : ScaleInfo;
  _scaleInfo          : Subscription;
  scaleSetup          : ScaleSetup;
  displayWeight       : string;

  inventoryAssignment   : IInventoryAssignment;
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

  initSubscriptions() {
    this._scaleInfo = this.scaleService.scaleInfo$.subscribe( data => {
      this.scaleInfo = data
    })

  }
  constructor(
    private _snackBar: MatSnackBar,
    private siteService: SitesService,
    public  route: ActivatedRoute,
    private menuService: MenuService,
    private fbInventory: FbInventoryService,
    private inventoryAssignmentService: InventoryAssignmentService,
    private inventoryLocationsService: InventoryLocationsService,
    private scaleService        : ScaleService,
    private dialog              : MatDialog,
    private fb: FormBuilder,
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
    this.initSubscriptions()

    this.locations$ = this.inventoryLocationsService.getLocations();
    this.inventoryLocations$ = this.locations$;
    this.site =  this.siteService.getAssignedSite();
    this.inputForm = this.fbInventory.initForm(this.inputForm)
    this.initSearchForm();
    if (this.id !=0) {
      this.inventoryAssignment$ = this.inventoryAssignmentService.getInventoryAssignment(this.site, this.id)
      this.inventoryAssignment$.subscribe( data=> {
        this.item = data
        this.inputForm = this.fbInventory.initForm(this.inputForm)
        this.inputForm = this.fbInventory.intitFormData(this.inputForm, data)
        this.productName = this.item.productName
      })

      this.locations$.subscribe(data => {
        this.inventoryLocations = data;
      })
    }
 
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
    if (!this.scaleValue && this.inputForm) {  return }
    const value = { packageQuantity: this.scaleValue};
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
        if (this.id != 0) {
          let item = this.inventoryAssignmentService.setItemValues(this.inputForm, this.item)
          const item$ = this.inventoryAssignmentService.editInventory(this.site,this.item.id, item)
          this.updateInventory(item$,exit)
        }

        if (this.id == 0) {
          let item = this.inventoryAssignmentService.setItemValues(this.inputForm, this.item)
          const item$ = this.inventoryAssignmentService.addInventoryItem(this.site, this.item)
          this.updateInventory(item$,exit)
        }
      }
    }
  }

  private updateInventory(item$: Observable<IInventoryAssignment>, exit: boolean) {
    item$.subscribe(data => {
      this.notifySave(data)
      this.inventoryAssignment = data;
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
    // console.log('updateitem failed')
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
      // console.log('get item')
      this.menuService.getMenuItemByID(this.site, item.id).subscribe(data => {
          this.menuItem = data
          // console.log('get item2')
          this.item = this.inventoryAssignmentService.assignProductToInventory(data, item)
          // console.log('get item3')
          this.item = this.inventoryAssignmentService.assignChemicals(data, item)
          // console.log('get item4')
          this.inputForm = this.fbInventory.intitFormData(this.inputForm, item)
          // console.log('get item5')
          this.initSearchForm();
        }
      )
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

  onCancel(event, openEditor) {
    if (this.inventoryAssignment) { 
      this.openInventoryDialog(this.inventoryAssignment.id)
      this.dialogRef.close(this.inventoryAssignment);
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

}
