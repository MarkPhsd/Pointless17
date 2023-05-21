import { O } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-email-entry',
  templateUrl: './email-entry.component.html',
  styleUrls: ['./email-entry.component.scss']
})
export class EmailEntryComponent implements OnInit {

  inputForm: UntypedFormGroup;
  order: IPOSOrder;
  email$: Observable<Component>;
  message: string;

  constructor(
      private fb: UntypedFormBuilder,
      private orderMethodService: OrderMethodsService,
      private dialogRef: MatDialogRef<EmailEntryComponent>,
      @Inject(MAT_DIALOG_DATA) public data: IPOSOrder
      ) {
        this.order = data;
  }

  ngOnInit(): void {
    this.message ='Input email and press send.'
    this.inputForm = this.fb.group({
      email: []
    })
  }

  emailOrder() {
    if (this.order) {
      const email = this.inputForm.controls['email'].value
      if (email) {
        this.message = 'Sending.'
        this.email$ = this.orderMethodService.emailOrderFromEntry(this.order, email).pipe(
          switchMap(data => {
            return of(data)
          })).pipe(
          switchMap(data => {
            this.message = 'Sent.'
            this.dialogRef.close();
            return of(data)
        }))
      }
    }
  }

  close() {

    this.dialogRef.close();
    // this.orderMethodService.clearOrder()
  }
}
