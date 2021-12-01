import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { IPurchaseOrderItem } from 'src/app/_interfaces';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { OrdersService } from 'src/app/_services';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-requires-serial',
  templateUrl: './requires-serial.component.html',
  styleUrls: ['./requires-serial.component.scss']
})
export class RequiresSerialComponent implements OnInit, OnDestroy {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect                     = new EventEmitter();

  inputForm         : FormGroup;
  searchPhrase      :  Subject<any> = new Subject();
  get serialCode() { return this.inputForm.get("serial") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  posItem  : IPurchaseOrderItem;

  keyboardOption      = false;
  keyboardDisplayOn   = false;

  constructor(private orderMethodService          : OrderMethodsService,
              private orderService                : OrdersService,
              private snackBar                    : MatSnackBar,
              private fb                          : FormBuilder,
              private dialogRef                   : MatDialogRef<RequiresSerialComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
      )
  {
    if (data) {
      this.posItem = data;
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy() {
    this.onCancel()
  }

  initFormSubscription() {
    this.inputForm.controls['serial'].valueChanges.subscribe(value => {
      if (value.length == 24) {
        this.applySerial(value)
      }
    });
  }

  initForm() {
    this.inputForm = this.fb.group({
      serial: ['']
    })
    this.initFormSubscription();
  }

  applySerial(serial: string) {
    if (this.posItem && serial) {
      this.posItem.serialCode = serial;
      this.orderMethodService.appylySerial(this.posItem).subscribe(data =>{
        if (data.order) {
          this.orderService.updateOrderSubscription(data.order)
          this.dialogRef.close({posItem: this.posItem, result : true});
        }
      })
    }
  }

  onCancel() {
    const serial = this.serialCode.value;
    if (this.posItem && (!this.posItem.serialCode || this.posItem.serialCode.length == 0) && (!serial || serial.length == 0)) {
      if (window.confirm(`If you cancel, the item may be removed from this order`)) {
        this.dialogRef.close({posItem: this.posItem, result : false});
      }
      return
    }
    this.dialogRef.close({posItem: this.posItem, result : true});
  }

  async deleteItem(item: IPOSOrderItem ) {
    this.dialogRef.close({posItem: this.posItem, result : false});
  }

  notifyEvent(message: string) {
    this.snackBar.open(message, 'Result', {verticalPosition: 'bottom', duration: 1000})
  }

}
