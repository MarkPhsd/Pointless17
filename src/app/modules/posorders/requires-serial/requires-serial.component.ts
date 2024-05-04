import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, Subject, of, switchMap } from 'rxjs';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { __asyncValues } from 'tslib';

@Component({
  selector: 'app-requires-serial',
  templateUrl: './requires-serial.component.html',
  styleUrls: ['./requires-serial.component.scss']
})
export class RequiresSerialComponent implements OnInit, OnDestroy {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect                     = new EventEmitter();

  action$ : Observable<any>;
  inputForm         : UntypedFormGroup;
  searchPhrase      :  Subject<any> = new Subject();
  get serialCode() { return this.inputForm.get("serial") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();

  id           : number;
  currentSerial: string;

  keyboardOption      = false;
  keyboardDisplayOn   = false;

  constructor(private orderMethodsService          : OrderMethodsService,
              private orderService                : OrdersService,
              private snackBar                    : MatSnackBar,
              private fb                          : UntypedFormBuilder,
              private siteService                 : SitesService,
              private dialogRef                   : MatDialogRef<RequiresSerialComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
      )
  {
    if (data) {
      this.id = data.id
      this.currentSerial = data.serial
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
      console.log('value.length', value.length)
      if (value.length == 24) {
        const item = value.toString().substr(0, 24)
        console.log('item', item)
        this.applySerial(value)
      }
    });
  }

  initForm() {
    this.inputForm = this.fb.group({
      serial: [this.currentSerial]
    })
    this.initFormSubscription();
  }

  applySerial(serial: string) {
    const site = this.siteService.getAssignedSite()
    let id : number;

    if (this.id && serial) {
      this.action$ =  this.orderMethodsService.appylySerial(this.id, serial).pipe(
        switchMap(data => {
          id = data.posItem.id
          const value = {order: data.order, id: data.posItem.id, result: true, posItem: data.posItem }
          // return this.orderService.getOrder(site, this.orderMethodsService?.order.id.toString(), false )

          console.log('value', value)
          this.orderMethodsService.updateOrder(data.order)
          this.dialogRef.close(value);
          return of(data)
      }))
    }
  }

  onCancel() {
    const serial = this.serialCode.value;
    if ((!this.currentSerial || this.currentSerial.length == 0) && (!serial || serial.length == 0)) {
        this.dialogRef.close({id: this.id, result : false});
      return
    }
    this.dialogRef.close({id: this.id, result : true});
  }

  async deleteItem(item: IPOSOrderItem ) {
    this.dialogRef.close({id: this.id, result : false});
  }

  notifyEvent(message: string) {
    this.snackBar.open(message, 'Result', {verticalPosition: 'bottom', duration: 1000})
  }

}
