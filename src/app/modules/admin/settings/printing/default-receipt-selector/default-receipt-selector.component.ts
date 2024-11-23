import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit,Input, Output  } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
@Component({
  selector: 'default-receipt-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './default-receipt-selector.component.html',
  styleUrls: ['./default-receipt-selector.component.scss']
})

export class DefaultReceiptSelectorComponent implements OnInit {

  @Input()  receipt           : ISetting;
  @Input()  receiptName       : string;
  @Input()  receiptID         : any;
  @Input()  receiptList$      : Observable<any>;
  @Input()  receiptList       : any;
  @Output() outPutReceiptName : EventEmitter<any> = new EventEmitter();

  inputForm: UntypedFormGroup;
  item$: Observable<ISetting>;

  constructor(
              private fb: UntypedFormBuilder,
              private siteService: SitesService) { }

  ngOnInit() {
    this.inputForm = this.fb.group({
      receiptID: []
    })
    this.inputForm.patchValue(this.receipt)
    this.formSubscriber();
  }

  setReceipt(event) {
    const site = this.siteService.getAssignedSite();
    if (this.receipt) {
      const value = this.inputForm.controls['receiptID'].value;
      this.receipt.option1 = this.receiptID
      this.outPutReceiptName.emit(this.receipt)
    }
  }

  formSubscriber() {
    this.inputForm.valueChanges.subscribe(data => {
      const value = this.inputForm.controls['receiptID'].value;
      this.receipt.option1 = value
      console.log(this.receipt.option1)
      this.outPutReceiptName.emit(this.receipt)
    })
  }

}

