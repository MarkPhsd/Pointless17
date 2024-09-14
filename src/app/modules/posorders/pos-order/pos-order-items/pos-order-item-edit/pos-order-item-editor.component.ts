import { Component,Inject,OnInit, Optional, } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { concatMap, Observable, of, switchMap } from 'rxjs';
import { PosOrderItem } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PosOrderItemMethodsService } from 'src/app/_services/transactions/pos-order-item-methods.service';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';

@Component({
  selector: 'pos-order-item-editor',
  templateUrl: './pos-order-item-editor.component.html',
  styleUrls: ['./pos-order-item-editor.component.scss']
})
export class PosOrderItemEditorComponent implements OnInit {

  inputForm: FormGroup
  item: PosOrderItem;
  action$: Observable<any>;
  orderSubItems: PosOrderItem[]
  action: string;
  actionInstructions : string;
  quantityActionType ='Quantity'
  dateTimeFormat = 'y-MM-dd h:mm:ss a';

  constructor(
    private orderService                : OrdersService,
    private posOrderItemMethodsService  : PosOrderItemMethodsService,
    private posOrderItemService         : POSOrderItemService,
    private siteService: SitesService,
    private dateHelper: DateHelperService,
    private fb: FormBuilder,
    @Optional() private dialogRef       : MatDialogRef<PosOrderItemEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) { 
      this.item = data?.item;
      this.action = data?.action
      this.orderSubItems = data?.orderItems;
    }
  }

  ngOnInit() {
    this.intForm()
    this.initInstructions()
  }

  intForm() {
    this.inputForm = this.fb.group({
      receivedDate: [],
      quantity: [],
      id: []
    })
    

    this.inputForm.patchValue(this.item)
    this.inputForm.patchValue({quantity : +this.item.quantity - +this.item.qtyReceived})
  }

  initInstructions() {
    if (this.action === 'billOnHold') {
      this.actionInstructions = 'Input Quantity Receiving. Set Date'
      this.quantityActionType ='Received Amt'
    }
  }

  receiveItem() { 
    const posItem = this.inputForm.value as PosOrderItem;
    const site = this.siteService.getAssignedSite()
    console.log('positem1', posItem)
    posItem.receivedDate = this.dateHelper.format( posItem.receivedDate,  this.dateTimeFormat)
    console.log('positem2', posItem)
    // return;
    posItem.receivedDate = this.dateHelper.format(this.inputForm.controls['receivedDate'].value, 'mm/dd/yyyy')

    // console.log()
    const data = {posItem: posItem, action: this.action} 
    // console.log('data', data)
    const item$ = this.posOrderItemService.postInventoryAction(site, data).pipe(concatMap(data => { 

      this.onCancel(true)
      return of(data)
    }))
    this.action$ = item$
  }



  updateSave(event) {
    const site = this.siteService.getAssignedSite()
    this.action$ =  this.posOrderItemService.putItem(site,this.inputForm.value).pipe(switchMap(data => {
      return of(data)
    }))
  }

  deleteSubItem(item) { 
    const site = this.siteService.getAssignedSite()
    this.action$ = this.posOrderItemService.deletePOSOrderItem(site, item?.id, item?.OrderID).pipe(switchMap(data => { 
      if (data) { 
        this.dialogRef.close(true)
      }
      return of(data)
    }))
  }

  saveExit(event) {
    const site = this.siteService.getAssignedSite()
    this.action$ =   this.posOrderItemService.putItem(site,this.inputForm.value).pipe(switchMap(data => {
      this.dialogRef.close(true)
      return of(data)
    }))
  }

  delete() {
    const warn = window.confirm('Are you sure you want to delete') 
    if (warn) { 
      const site = this.siteService.getAssignedSite()
      this.action$ = this.posOrderItemService.deletePOSOrderItem(site, this.item.id,this.item.orderID).pipe(switchMap(data => { 
        if (data) { 
          this.onCancel(true)
        }
        return of(data)
      }))
    }
  }

  onCancel(result: boolean) { 
    this.dialogRef.close(result)
  }

}


