import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';

@Component({
  selector: 'app-requires-serial',
  templateUrl: './requires-serial.component.html',
  styleUrls: ['./requires-serial.component.scss']
})
export class RequiresSerialComponent implements OnInit {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect                     = new EventEmitter();

  inputForm         : FormGroup;
  searchPhrase      :  Subject<any> = new Subject();
  get serialCode() { return this.inputForm.get("serial") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  posItem  : IPOSOrderItem;

  keyboardOption      = false;
  keyboardDisplayOn   = false;

  constructor(private orderMethodService          : OrderMethodsService,
              private posOrderItemService         : POSOrderItemServiceService,
              private orderService                : OrdersService,
              private siteService                 : SitesService,
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
          this.dialogRef.close();
        }
      })
    }
  }

  onCancel() {
    const serial = this.serialCode.value;

    console.log('on cancel 1 ')

    if (this.posItem && this.posItem.serialCode.length == 0 && serial.length == 0) {
      console.log('on cancel 2 ')
      if (window.confirm(`If you cancel, the item may be removed from this order`)) {
        this.deleteItem(this.posItem)
        this.dialogRef.close();
      }
      return
    }

    console.log('on cancel')
    this.dialogRef.close();
    //it's already goign to be updated if the serial exists.
    if (serial) {
      if (serial.length == 24)  {

      }
    }

  }

  async deleteItem(item: IPOSOrderItem ) {

    const site = this.siteService.getAssignedSite();
    const orderID = item.orderID;

    if (item.id) {
      let result = await this.posOrderItemService.deletePOSOrderItem(site, item.id).pipe().toPromise();
      if (result.scanResult) {
        this.notifyEvent('Item Deleted')
      } else  {
        this.notifyEvent('Item must be voided')
      }

      if (result && result.order) {
        this.orderService.updateOrderSubscription(result.order);
      }
      this.dialogRef.close();
    }

  }

  notifyEvent(message: string) {
    this.snackBar.open(message, 'Result', {verticalPosition: 'bottom', duration: 1000})
  }

}
