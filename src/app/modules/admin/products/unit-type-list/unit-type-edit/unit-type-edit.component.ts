import { Component,  Inject,  Input, OnInit} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormBuilder,  UntypedFormGroup } from '@angular/forms';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import {  UnitType,  } from 'src/app/_interfaces/menu/price-categories';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FbUnitTypeService } from 'src/app/_form-builder/fb-unit-type.service';
import { Observable, of, switchMap} from 'rxjs';

@Component({
  selector: 'app-unit-type-edit',
  templateUrl: './unit-type-edit.component.html',
  styleUrls: ['./unit-type-edit.component.scss']
})
export class UnitTypeEditComponent implements OnInit {

  @Input() unitType       : UnitType;
  inputForm               : UntypedFormGroup;
  showMore                :  boolean;
  showTime                :  boolean;
  showConversions         :  boolean;
  action$                 : Observable<any>;

  // get productPrices() : FormArray {
  //   return this.inputForm.get('productPrices') as FormArray;
  // }
  // unitTypes$: Observable<UnitType[]>;
  // unitTypes :  IItemBasic[]
  fieldOptions = { prefix: 'R$ ', thousands: '.', decimal: ',', precision: 2 }

  constructor(
    private _snackBar   : MatSnackBar,
    private fb                      : UntypedFormBuilder,
    private siteService             : SitesService,
    private dialog                  : MatDialog,
    private fbPriceCategory         : FbUnitTypeService,
    private unitTypeService: UnitTypesService,
    private dialogRef: MatDialogRef<UnitTypeEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UnitType
    )
  {
    console.log(data)
    if (data) {
      this.refreshData_Sub(data)
      return
    }
    if (!data) {
      this.refreshData();
      return
    }
  }

  ngOnInit() {
    console.log('')
  };

  refreshData() {
    const site          = this.siteService.getAssignedSite()

    if (!this.unitType || this.unitType.id) {
      const item = {} as UnitType;
      this.refreshData_Sub(item);
      return;
    }
    const item$         = this.unitTypeService.get(site, this.unitType.id);

    this.action$ = item$.pipe(
      switchMap(data => {
      if (!data) {
        const item = {} as UnitType;
        this.refreshData_Sub(item)
        return of(item)
      }
      this.refreshData_Sub(data)
      return of(data)
    }))

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

  updateOnly(item) {
    this.action$ = this.update(item)
  }

  update(item): Observable<any>{
    let result: boolean;
    if (!this.inputForm.valid) { return }
    const unitType = this.inputForm.value;
    const site = this.siteService.getAssignedSite()
    const item$ = this.unitTypeService.save(site, unitType)
    return  item$.pipe(
       switchMap( data => {
        this.refreshData_Sub(data)
        this.notifyEvent('Item Updated', 'Success')
        return of(data)
      })
    )
  };

  updateExit(item) {
    this.action$ = this.update(this.inputForm.value).pipe(
      switchMap( data => {
        this.refreshData_Sub(data)
        this.onCancel(item);
        return of(true)
      })
    )
  }

  onCancel(event) {
    this.dialogRef.close(true);
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
