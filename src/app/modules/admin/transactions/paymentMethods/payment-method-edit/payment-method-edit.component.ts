import { Component,  Inject,   OnInit,  } from '@angular/core';
import { Router } from '@angular/router';
import { AWSBucketService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import {  UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { tap } from 'rxjs/operators';
import { IPaymentMethod, PaymentMethodsService, PaymentMethodFeatures } from 'src/app/_services/transactions/payment-methods.service';

import { EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'app-payment-method-edit',
  templateUrl: './payment-method-edit.component.html',
  styleUrls: ['./payment-method-edit.component.scss']
})
export class PaymentMethodEditComponent  implements OnInit {
  image   : string;
  id                     :any;
  paymentMethod          :IPaymentMethod;
  bucketName             :string;
  awsBucketURL           :string;
  inputForm              :UntypedFormGroup;
  featuresForm           :UntypedFormGroup;         
  instructions: string;
  itemFeatures : PaymentMethodFeatures;

  constructor(
    private paymentMethodService    : PaymentMethodsService,
    private siteService             : SitesService,
    private snack                   : MatSnackBar,
    private dialogRef: MatDialogRef<PaymentMethodEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)

  {
    console.log('constructor', data)
    if (data) {
      this.id = data
      // this.clientType = data
    } else {
      // this.id = this.route.snapshot.paramMap.get('id');
    }
    this.initializeForm()
  }

     ngOnInit() {
      console.log('constructor')

      // this.bucketName =       await this.awsBucket.awsBucket();
      // this.awsBucketURL =     await this.awsBucket.awsBucketURL();
    };

    initializeForm()  {

      this.initFormFields()
      if (this.inputForm && this.id) {
        const site = this.siteService.getAssignedSite();
        const payments$ = this.paymentMethodService.getPaymentMethod(site, this.id).pipe(
            tap(data => {
              if (data) {
                this.paymentMethod = data
                this.id         = data.id
                this.inputForm.patchValue(this.paymentMethod)
              }

              let itemFeatures = JSON.parse(this.paymentMethod?.json) as PaymentMethodFeatures
              if (!itemFeatures) { itemFeatures = {} as  PaymentMethodFeatures}
              this.itemFeatures = itemFeatures;
              this.image = this.itemFeatures?.image;
            }
          )
        );
        payments$.subscribe(
          data => {
            this.paymentMethod = data
            this.id          = data.id
        })
      }

      if (!this.id)  {
        let itemFeatures
        if (!itemFeatures) { itemFeatures = {} as  PaymentMethodFeatures}
        this.paymentMethod = {} as IPaymentMethod;
        this.inputForm.patchValue(this.paymentMethod)
      }

    };

    initFormFields() {
      this.inputForm  = this.paymentMethodService.initForm(this.inputForm)
    }

    updateItem(event): Observable<IPaymentMethod> {
        if (this.inputForm.valid) {
          const payment = this.getPaymentInfo()            
          const site = this.siteService.getAssignedSite()
          return this.paymentMethodService.saveItem(site, payment)
        }
        this.siteService.notify('Form not valid', 'close', 5000, 'red')
    };
    _updateItem() {
      const item$ = this.updateItem(null).subscribe(data => {
        if (!data) {
          this.siteService.notify('Not saved', 'close', 5000, 'red')
          return
        }
        this.siteService.notify('Saved', 'close', 5000, 'red')
      })
    }

    getPaymentInfo() {
      let payment = this.inputForm.value;
      this.itemFeatures.image = this.image;
      payment.json = JSON.stringify(this.itemFeatures);
      return payment;
    }

    update(item$: Observable<IPaymentMethod>, close: boolean){
      item$.subscribe(
        {
          next: data => {
          this.snack.open('Item Updated', 'Success', {duration:2000, verticalPosition: 'bottom'})
          if (close) {
            this.onCancel(true)
          }
        }, error: error => {
          this.snack.open(`Update item. ${error}`, "Failure", {duration:2000, verticalPosition: 'bottom'})
        }
        }
      )
    }

    applyImage(event)  {
      this.image = event
      let payment = this.inputForm.value;
      this.itemFeatures.image = this.image;
      payment.json = JSON.stringify(this.itemFeatures);
    }

    save(event) {
      const item$ = this.updateItem(event);
      this.update(item$, false)
    }

    updateItemExit(event) {
      const item$ = this.updateItem(event);
      this.update(item$, true)
    }

    onCancel(event) {
      this.dialogRef.close();
    }

    deleteItem(event) {
      console.log('delete', event, this.paymentMethod.id)
      const site = this.siteService.getAssignedSite()
      this.paymentMethodService.delete(site, this.paymentMethod.id).subscribe( data =>{
        this.snack.open("Item deleted", "Success", {duration:2000, verticalPosition: 'top'})
        this.onCancel(event)
    })
    }

    copyItem(event) {
      //do confirm of delete some how.
      //then
    }



}
