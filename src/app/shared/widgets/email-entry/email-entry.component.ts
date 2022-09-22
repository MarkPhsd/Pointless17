import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-email-entry',
  templateUrl: './email-entry.component.html',
  styleUrls: ['./email-entry.component.scss']
})
export class EmailEntryComponent implements OnInit {

  inputForm: FormGroup;
  order: IPOSOrder;
  email$: Observable<Component>;

  constructor(
      private fb: FormBuilder,
      private orderMethodService: OrderMethodsService,
      private dialogRef: MatDialogRef<EmailEntryComponent>,
      @Inject(MAT_DIALOG_DATA) public data: IPOSOrder
      ) { 
        this.order = data;
  }

  ngOnInit(): void {
    this.inputForm = this.fb.group({
      email: []
    })
  }

  emailOrder() { 
    if (this.order) {   
      this.email$ = this.orderMethodService.emailOrder(this.order)
      // .subscribe(data => { 

      // })
    }
  }

  close() { 
    this.orderMethodService.clearOrder()
  }
}
