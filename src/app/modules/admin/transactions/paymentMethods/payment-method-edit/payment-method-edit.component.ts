import { Component,  Inject,  Input, Output, OnInit, Optional,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AWSBucketService, ContactsService, MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs/operators';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';

@Component({
  selector: 'app-payment-method-edit',
  templateUrl: './payment-method-edit.component.html',
  styleUrls: ['./payment-method-edit.component.scss']
})
export class PaymentMethodEditComponent  implements OnInit {

  id                     :any;
  paymentMethod          :IPaymentMethod;
  bucketName             :string;
  awsBucketURL           :string;
  inputForm              :FormGroup;

  constructor(
    private paymentMethodService    : PaymentMethodsService,
    private siteService             : SitesService,
    private snack                   : MatSnackBar,
    private awsBucket               : AWSBucketService,
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

    async ngOnInit() {
      this.bucketName =       await this.awsBucket.awsBucket();
      this.awsBucketURL =     await this.awsBucket.awsBucketURL();
    };

    async initializeForm()  {

      this.initFormFields()
      if (this.inputForm && this.id) {
        const site = this.siteService.getAssignedSite();
        const payments$ = this.paymentMethodService.getPaymentMethod(site, this.id).pipe(
            tap(data => {
              if (data) {
                this.paymentMethod = data
                this.id         = data.id
                this.inputForm.patchValue(this.paymentMethod)
                console.log(this.paymentMethod)
              }
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
        this.paymentMethod = {} as IPaymentMethod;
        this.inputForm.patchValue(this.paymentMethod)
      }

    };

    initFormFields() {
      this.inputForm  = this.paymentMethodService.initForm(this.inputForm)
    }

    async updateItem(event): Promise<boolean> {
      let result: boolean;

      return new Promise(resolve => {
         if (this.inputForm.valid) {
          const site = this.siteService.getAssignedSite()
          const item$ = this.paymentMethodService.saveItem(site, this.inputForm.value)
          item$.subscribe( data => {
            this.snack.open('Item Updated', 'Success', {duration:2000, verticalPosition: 'bottom'})
            resolve(true)
          }, error => {
            this.snack.open(`Update item. ${error}`, "Failure", {duration:2000, verticalPosition: 'bottom'})
            resolve(false)
          })
         }
        }
      )

    };

    async updateItemExit(event) {
      const result = await this.updateItem(event)
      if (result) {
        this.onCancel(event);
      }
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
