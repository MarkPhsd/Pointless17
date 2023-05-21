import { Component, Inject, OnInit } from '@angular/core';
import { FbItemTypeService } from 'src/app/_form-builder/fb-item-type.service';
import { FlatRateTaxValue, FlatRateTax, IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { UntypedFormBuilder, UntypedFormGroup, FormControl, Validators, UntypedFormArray } from '@angular/forms';
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
import { group } from '@angular/animations';
import { DefaultMatCalendarRangeStrategy } from '@angular/material/datepicker';

@Component({
  selector: 'app-flat-rate-edit',
  templateUrl: './flat-rate-edit.component.html',
  styleUrls: ['./flat-rate-edit.component.scss']
})
export class FlatRateEditComponent  {


  flatRateTax:       FlatRateTax;
  id:                any;

  flatRateTax$:      Observable<FlatRateTax>;

  inputForm:         UntypedFormGroup;
  get flatRateTaxValues(): UntypedFormArray  {
    return this.inputForm.get('flatRateTaxValues') as UntypedFormArray;
  }

  constructor(
      private fb: UntypedFormBuilder,
      private fbFlatRateService: FBFlatRateService,
      private flatRateService: FlatRateService,
      private router: Router,
      public route: ActivatedRoute,
      private _snackBar: MatSnackBar,
      private taxes: TaxesService,
      private siteService: SitesService,
      private dialogRef: MatDialogRef<FlatRateEditComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
      )
  {
    if (data) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }

    console.log(this.id)
    this.initForm();
    this.refreshFormValues(this.id)

  }

  initForm() {
    this.inputForm = this.fb.group( {
      id:                 [''],
      name:               [''],
      flatRateTaxValues: this.fb.array([

      ])
    })


  }

  refreshFormValues(id: any) {
    if (!id) {
      this.flatRateTax = {} as FlatRateTax
    } else {
      const site= this.siteService.getAssignedSite();
      this.flatRateTax$ = this.flatRateService.getItem(site,id)
      this.flatRateTax$.subscribe(data=> {
        this.flatRateTax = data

        this.inputForm.patchValue(this.flatRateTax)
        this.flatRateTax.flatRateTaxValues.forEach(data => {
          this.addTaxValueGroup();
        })
        this.inputForm.patchValue(this.flatRateTax)
        // this.addTaxValueGroup();
      })
    }


  }

  addTaxValueGroup(): UntypedFormArray {
      const add = this.inputForm.get('flatRateTaxValues') as UntypedFormArray;
      add.push(this.fb.group({
            id:                 [''],
            rateStart:          [''],
            rateEnd:            [''],
            fee:                [''],
            flatRateTaxID:      [''],
        }
      ))
      return add
  }

  refreshValueGroup(flatRateTaxValues: FlatRateTaxValue): UntypedFormArray {
    this.addTaxValueGroup();
    const add = this.inputForm.get('flatRateTaxValues') as UntypedFormArray;
    add.push(this.fb.group({
          id:                 [flatRateTaxValues.id],
          rateStart:          [flatRateTaxValues.rateStart],
          rateEnd:            [flatRateTaxValues.rateEnd],
          fee:                [flatRateTaxValues.fee],
          flatRateTaxID:      [flatRateTaxValues.flatRateTaxID],
      }
    ))
    return add
}

  deleteTaxGroup(index: number) {
    console.log(index)
    const add = this.inputForm.get('flatRateTaxValues') as UntypedFormArray;
    add.removeAt(index)
  }

  initializeForm(id: any, form: UntypedFormGroup)  {

    if (form && this.id) {

      const site = this.siteService.getAssignedSite();
      this.flatRateTax$ = this.flatRateService.getItem(site, id)

      this.flatRateTax$.pipe(
          tap(data => {
            this.flatRateTax = data
            this.inputForm.patchValue(this.flatRateTax)
          }
        )
      )

      this.flatRateTax$.subscribe( data => {
            this.flatRateTax = data
            this.inputForm.patchValue(this.flatRateTax)
        }
      )
    }
   };

  initFormFields():UntypedFormGroup {
    this.inputForm  = this.fbFlatRateService.initForm(this.inputForm);
    return this.inputForm;
  }

  // export interface FlatRatesTaxValue {
  //   id:                 number;
  //   rateStart:          number;
  //   rateEnd:            number;
  //   fee:                number;
  //   flatRateTaxID:      number; -->

    addRate() {
    // this.fbFlatRateService.addFlatTaxRate()
      const add = this.inputForm.get('flatRatesTaxValues') as UntypedFormArray;

      add.push(this.fb.group({
            id:                 [''],
            rateStart:          ['', Validators.required],
            rateEnd:            ['' , Validators.required],
            fee:                ['', Validators.required],
            flatRateTaxID:      [''],
        }))
    }

    submitRate() {

      const site = this.siteService.getAssignedSite()
      // const client$ = this.clientTableService.saveClient(site, this.userForm.value)
      const flatRateTax = this.inputForm.value;
      this.flatRateTax$ = this.flatRateService.postRate(site, flatRateTax)
      this.flatRateTax$.subscribe( data => {
        this.notifyEvent('Flat RateTax Uploaded','Succes')
      }, error=>
      {
        this.notifyEvent('Success', error)
      })
    }

    deleteTaxValue(i: any) {
      console.log(i)
      const add = this.inputForm.get('flatRateTaxValues') as UntypedFormArray;
      if (this.flatRateTax.flatRateTaxValues[i]) {
        this.deleteRate(this.flatRateTax.flatRateTaxValues[i])
      }
      add.removeAt(i)
    }

    deleteRate(flatRateTaxValues: FlatRateTaxValue) {
      const site = this.siteService.getAssignedSite()

      this.flatRateService.deleteFlateRateTaxValue(site, flatRateTaxValues.id).subscribe( data => {
        this.notifyEvent('Flat Rate deleted','Succes')

      }, error=>
      {
        this.notifyEvent('error', error)
      })

    }

    deleteGroup(flatRateTax: FlatRateTax) {
      const site = this.siteService.getAssignedSite()
      this.flatRateService.deleteFlatRateTax(site, flatRateTax.id).subscribe( data => {
        this.onCancel();
        this.notifyEvent('Flat Range deleted','Succes')

      }, error=>
      {
        this.notifyEvent('error', error)
      })
    }

    delete() {
        this.deleteGroup(this.flatRateTax)

    }

    save(){
      this.update();
    }

    async update(): Promise<boolean> {
      let result: boolean;

      return new Promise(resolve => {
          if (this.inputForm.valid) {
          this.setNonFormValues()
          const site = this.siteService.getAssignedSite()
          const product$ = this.flatRateService.putRate(site, this.flatRateTax)

          product$.subscribe( data => {
            console.log(data)
            this.notifyEvent('Item Updated', 'Success')
            resolve(true)

          }, error => {
            console.log(error)
            this.notifyEvent(`Update item. ${error}`, "Failure")
            resolve(false)

          })
          }
        }
      )
    };

    transformPriceAmount(element){
      // element =element
      // this.price = this.currencypipe.transform(this.price, '$');
      // element.target.value = this.price;
    }

    async updateExit() {
      console.log('message')
      const result = await this.update()

      if (result) {
        this.onCancel();
      }
    }

    setNonFormValues() {
      if (this.flatRateTax && this.inputForm) {

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
