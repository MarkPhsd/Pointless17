import { Component,  Inject,  Input, OnInit} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder,  FormGroup } from '@angular/forms';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import {  UnitType,  } from 'src/app/_interfaces/menu/price-categories';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FbUnitTypeService } from 'src/app/_form-builder/fb-unit-type.service';

@Component({
  selector: 'app-unit-type-edit',
  templateUrl: './unit-type-edit.component.html',
  styleUrls: ['./unit-type-edit.component.scss']
})
export class UnitTypeEditComponent implements OnInit {

  @Input() unitType       : UnitType;
  inputForm               : FormGroup;
  showMore                :  boolean;
  showTime                :  boolean;
  showConversions         :  boolean;

  // get productPrices() : FormArray {
  //   return this.inputForm.get('productPrices') as FormArray;
  // }
  // unitTypes$: Observable<UnitType[]>;
  // unitTypes :  IItemBasic[]
  fieldOptions = { prefix: 'R$ ', thousands: '.', decimal: ',', precision: 2 }

  constructor(
    private _snackBar   : MatSnackBar,
    private fb                      : FormBuilder,
    private siteService             : SitesService,
    private dialog                  : MatDialog,
    private fbPriceCategory         : FbUnitTypeService,
    private unitTypeService: UnitTypesService,
    private dialogRef: MatDialogRef<UnitTypeEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UnitType
    )
  {
    if (data) {
      this.refreshData_Sub(data)
    }
  }

  ngOnInit() {
    console.log('')
  };

  async refreshData() {
    const site          = this.siteService.getAssignedSite()
    const item$         = this.unitTypeService.get(site, this.unitType.id);
    const data          = await item$.pipe().toPromise()
    if (data) {
      this.refreshData_Sub(data)
    }
  }

  refreshData_Sub(item: UnitType) {
    if (item) {
      this.unitType = item;
      this.inputForm = this.fbPriceCategory.initForm(this.inputForm);
      this.inputForm.patchValue(item)
     }
  }

  toggleShowMore() {
    this.showMore = !this.showMore
  }
  toggleShowTime() {
    this.showTime = !this.showTime
  }
  toggleShowConversion() {
    this.showConversions = !this.showConversions
  }

  debugitem(item) {
    console.log(item.value)
  }

  async update(item): Promise<boolean> {
    let result: boolean;
    if (!this.inputForm.valid) { return }
    const unitType = this.inputForm.value;
    return new Promise(resolve => {
      const site = this.siteService.getAssignedSite()
      const product$ = this.unitTypeService.save(site, unitType)
      product$.subscribe( data => {
        this.notifyEvent('Item Updated', 'Success')
        resolve(true)
        }, error => {
          this.notifyEvent(`Update item. ${error}`, "Failure")
          resolve(false)
        })
      }
    )
  };

  async updateExit(item) {
    const result = await this.update(this.inputForm.value)
    if (result) {
      this.onCancel(item);
    }
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  delete(item) {
    if (!this.inputForm.valid) { return }
    const site = this.siteService.getAssignedSite()
    if (!item) { return }
      const unit = this.inputForm.value;
      this.unitTypeService.delete(site, unit.id).subscribe( data =>{
        this.notifyEvent("Item deleted", "Success")
        this.onCancel(item)
    })
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
