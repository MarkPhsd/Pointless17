import { O } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-email-entry',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
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
