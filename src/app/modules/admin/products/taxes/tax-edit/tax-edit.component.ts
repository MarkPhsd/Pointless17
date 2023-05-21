import { Component, Inject, OnInit } from '@angular/core';
import { FbItemTypeService } from 'src/app/_form-builder/fb-item-type.service';
import { FlatRateTaxValue, FlatRateTax } from 'src/app/_services/menu/item-type.service';
import { UntypedFormBuilder, UntypedFormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MatSnackBar} from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TaxesService } from 'src/app/_services/menu/taxes.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FlatRateService } from 'src/app/_services/map-routing/flat-rate.service';
import { FBFlatRateService } from 'src/app/_form-builder/fbflat-rate.service';
import { TaxRate } from 'src/app/_interfaces';

@Component({
  selector: 'app-tax-edit',
  templateUrl: './tax-edit.component.html',
  styleUrls: ['./tax-edit.component.scss']
})
export class TaxEditComponent {

  taxColumns = [1,2,3]
  id:                any;
  taxRate:           TaxRate;
  taxes$:            Observable<TaxRate>;
  inputForm:         UntypedFormGroup;

  constructor(
      private fb: UntypedFormBuilder,
      private taxesService: TaxesService,
      private router: Router,
      public route: ActivatedRoute,
      private _snackBar: MatSnackBar,
      private siteService: SitesService,
      private dialogRef: MatDialogRef<TaxEditComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
      )
  {
    if (data) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }
    this.initForm();
    this.refreshFormValues(this.id)
  }

  initForm() {
    this.inputForm = this.fb.group( {
      id:                   [''],
      name:                 ['',Validators.required],
      amount:               ['', Validators.required],
      taxColumn:            ['', Validators.required],
    })
  }

  refreshFormValues(id: any) {
    if (!id) {
      this.taxRate = {} as TaxRate
    } else {
      const site= this.siteService.getAssignedSite();
      this.taxes$ = this.taxesService.getTaxRate(site,id)
      this.taxes$.subscribe(data=> {
        this.taxRate = data
        this.inputForm.patchValue(this.taxRate)
      })
    }
  }

  initializeForm(id: any, form: UntypedFormGroup)  {
    if (form && this.id) {
      const site = this.siteService.getAssignedSite();
      this.taxes$ = this.taxesService.getTaxRate(site,id)
      this.taxes$.pipe(
          tap(data => {
            this.taxRate = data
            this.inputForm.patchValue(this.taxRate)
          }
        )
      )
    }
  };

  add() {
    const site = this.siteService.getAssignedSite()
    // const client$ = this.clientTableService.saveClient(site, this.userForm.value)
    const taxRate = this.inputForm.value;
    this.taxes$ = this.taxesService.postTaxRate(site, taxRate)
    this.taxes$.subscribe( data => {
      this.notifyEvent('Add','Succes')
    }, error=>
    {
      this.notifyEvent('Failure adding', error)
    })
    this.onCancel();
  }

  async update(): Promise<boolean> {
    let result: boolean;

    return new Promise(resolve => {
        if (this.inputForm.valid) {
        this.setNonFormValues()
        const taxRate = this.inputForm.value;
        const site = this.siteService.getAssignedSite()
        const tax$ = this.taxesService.putTax(site, taxRate.id, taxRate)
        tax$.subscribe( data => {
          this.notifyEvent('Item Updated', 'Success')
          resolve(true)
        }, error => {
          this.notifyEvent(`Error updating item. ${error}`, "Failure")
          resolve(false)
        })
        this.onCancel();
        }
      }
    )
  };

  deleteRate(id: any) {
    const site = this.siteService.getAssignedSite()
    this.taxesService.deleteTax(site, id).subscribe( data => {
      this.onCancel();
      this.notifyEvent('Deleted','Succes')
    }, error=>
    {
      this.notifyEvent('error', error)
    })
  }

  delete() {
    this.deleteRate(this.id)
  }

  save(){
    if (this.id)
    {
      console.log('update')
       this.update();}
     else
    { console.log('add')
    this.add() }
  }


  transformPriceAmount(element){
    // element =element
    // this.price = this.currencypipe.transform(this.price, '$');
    // element.target.value = this.price;
  }

  async updateExit() {
    const result = await this.update()
    if (result) {
      this.onCancel();
    }
  }

  setNonFormValues() {
    if (this.taxRate && this.inputForm) {

    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  deleteItem() {
    //do confirm of delete some how.
    //then
  }

  copyItem() {
    //do confirm of delete some how.
    //then
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }


  }
