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

@Component({
  selector: 'app-move-inventory-location',
  templateUrl: './move-inventory-location.component.html',
  styleUrls: ['./move-inventory-location.component.scss']
})
export class MoveInventoryLocationComponent implements OnInit {

  id: any;
  site: ISite;
  inventoryAssignment:       IInventoryAssignment;
  inventoryLocations:        IInventoryLocation[];
  inventoryAssignment$:      Observable<IInventoryAssignment>;
  searchForm:                FormGroup;
  quantityMoving:            number;
  metrcLocations$:           Observable<IInventoryLocation[]>;
  inventoryLocation:         IInventoryLocation;
  inventoryLocationID:       number;

  existingItem:         IInventoryAssignment;
  newItem    :          IInventoryAssignment;

  constructor(private _snackBar: MatSnackBar,
              private siteService: SitesService,
              public route: ActivatedRoute,
              private fb: FormBuilder,
              private inventoryAssignmentService: InventoryAssignmentService,
              private inventoryLocationsService: InventoryLocationsService,
              private dialogRef: MatDialogRef<MoveInventoryLocationComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any)
  {

    if (data) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }

    this.metrcLocations$ = this.inventoryLocationsService.getLocations();
    const site =  this.siteService.getAssignedSite();
    this.inventoryAssignment$ = this.inventoryAssignmentService.getInventoryAssignment(site, this.id)

  }

  ngOnInit() {
    this.metrcLocations$.subscribe(data => {  this.inventoryLocations = data })
    if (this.id) {
      this.inventoryAssignment$.subscribe(data=>{ this.inventoryAssignment = data })
      this.initForm();
      this.searchForm.patchValue(this.inventoryAssignment)
    }
  }

  initForm() {
    this.searchForm = this.fb.group({
      quantityMoving: ['']
    })
  }

  getLocation(event) {
    this.inventoryLocationID = event.value
    if (this.inventoryLocationID == 0) {
      this.inventoryLocation = null
      return
    }
    if (event.value) {
      this.assignLocation(this.inventoryLocationID);
    }
  }

  assignLocation(id: number){
    this.inventoryLocationsService.getLocation(id).subscribe( data => {
      this.inventoryLocation = data
    })
  }

  async  changeIsValid(): Promise<boolean> {

    if (this.quantityMoving  == 0 || this.quantityMoving == null) {
      this.notifyEvent('Quantity required to move item', '')
      return false
    }

    if ( this.inventoryAssignment.packagedOrBulk == 0 )  {
      if (parseInt(this.quantityMoving.toString()) == this.quantityMoving) {
        console.log(parseInt(this.quantityMoving.toString()) , this.quantityMoving)
      } else {
        this.notifyEvent('Only whole values allowed.', '')
        this.quantityMoving = 0
        return false
      }
    }

    if ( this.quantityMoving > this.inventoryAssignment.packageCountRemaining ) {
      this.notifyEvent('Exceeds allowed amount.', '')
      this.quantityMoving =0
      return false
    }


    return true
  }

  async  updateInventory() {
        //the couunt we use is the packageCountremaining.
    const result = this.changeIsValid() ;
    if (!result) {
      return
    }

    if (this.inventoryAssignment.packageCountRemaining != this.quantityMoving) {
      if (this.inventoryAssignment.packageCountRemaining >= this.quantityMoving) {
        await this.copyToNewPackage()
        return
      }
    }

    if (this.inventoryAssignment.packageCountRemaining === this.quantityMoving ) {
      this.changeLocation();
      return
    }

  }

  async getMovingPackageCounts(): Promise<IInventoryAssignment[]> {

    this.newItem                       = await this.inventoryAssignment$.pipe().toPromise() //(data=>{ this.newItem = data })

    //the new item will start with what the old item currently has
    this.newItem.baseQuantity          = this.newItem.baseQuantityRemaining
    this.newItem.packageQuantity       = this.newItem.packageCountRemaining

    //to remove the base of the original package.
    const newBaseQuantity              = this.newItem.baseQuantityRemaining

    const  baseCalculated              = (this.newItem.unitMulitplier * this.quantityMoving) * this.newItem.jointWeight;
    const  baseQuantityToMove          = baseCalculated;
    const  newPackageQuantity          = this.quantityMoving;


    this.newItem.baseQuantity          = baseQuantityToMove;
    this.newItem.baseQuantityRemaining = baseQuantityToMove;
    this.newItem.packageQuantity       = newPackageQuantity;
    this.newItem.packageCountRemaining = newPackageQuantity;

    console.log('newPackageQuantity', newPackageQuantity)

    const item = await this.setLocation(this.newItem);
    if (item) {  this.newItem = item; }

    this.newItem.id                         = 0;
    this.existingItem                       = await this.inventoryAssignment$.pipe().toPromise();
    const existingBase                      = this.existingItem.baseQuantity;
    console.log('Base Quantity', this.existingItem.baseQuantity, existingBase, baseQuantityToMove)
    this.existingItem.baseQuantity          = existingBase;
    this.existingItem.baseQuantityRemaining = existingBase - baseQuantityToMove;

    console.log('Package Quantity', this.existingItem.packageQuantity, newPackageQuantity)
    this.existingItem.packageQuantity       = this.existingItem.packageQuantity       - newPackageQuantity;
    this.existingItem.packageCountRemaining = this.existingItem.packageCountRemaining - newPackageQuantity;

    const packages = [] as IInventoryAssignment[];
    packages.push(this.existingItem)
    packages.push(this.newItem)

    //change
    // return;
    return packages
  }

  async setLocation(item: IInventoryAssignment): Promise<IInventoryAssignment> {
    const location = this.inventoryLocation;
    if (location) {
      item.location = location.name;
      item.locationID = location.id;
    }
    return item
  }


  getValue(item: string): number {
    try {
      const f = this.searchForm;
      if (f.get(item).value === undefined || f.get(item).value === null) { return 0} else {
        return  f.get(item).value
      }
    } catch (error) {
      return 0
    }
  }


  async copyToNewPackage(){
    const site     =  this.siteService.getAssignedSite();
    const packages =  await  this.getMovingPackageCounts()
    // return
    const new$     =  this.inventoryAssignmentService.moveInventory(site, packages);
    new$.subscribe( data => {
      this.onCancel(true)
      this.notifyEvent('New . Package moved', 'Success')
    })
  }

  async changeLocation() {

    if (this.inventoryLocation) {
      if (!this.changeIsValid) { return }

      const site =  this.siteService.getAssignedSite();

      this.inventoryAssignment.locationID = this.inventoryLocation.id
      this.inventoryAssignment.location = this.inventoryLocation.name

      //then we need to change all the package values.
      //we can also leave a note that this was from inventory moving.

      //we have to push a new inventory assignment
      //and put the existing one with the change.

      //change
      // return;

      this.inventoryAssignmentService.editInventory(site,
          this.inventoryAssignment.id,
          this.inventoryAssignment

          ).subscribe( data=> {

            this.notifyEvent('Inventory location changed.', 'Success')
            this.onCancel(true)

        }, error =>{
          this.notifyEvent(`Inventory location failed to change. ${error}`, 'failed')
        }

      )

    } else {
      this.notifyEvent('Item not found.', 'failed')
    }

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
