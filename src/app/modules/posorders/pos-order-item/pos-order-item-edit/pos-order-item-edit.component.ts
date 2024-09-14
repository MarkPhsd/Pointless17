import { Component, EventEmitter, Inject, Input, Output, } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { PosOrderItemMethodsService } from 'src/app/_services/transactions/pos-order-item-methods.service';
import { Observable, of, switchMap } from 'rxjs';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
  selector: 'app-pos-order-item-edit',
  templateUrl: './pos-order-item-edit.component.html',
  styleUrls: ['./pos-order-item-edit.component.scss']
})
export class PosOrderItemEditComponent  {

  @Input() purchaseOrderEnabled: boolean;
  @Output() closeOnEnterPress = new EventEmitter();
  inputForm   : UntypedFormGroup;
  posOrderItem: PosOrderItem;
  editField   = 'modifierNote'
  instructions: 'Make changes'
  menuItem    : IMenuItem;
  decimals    = 2;
  requireWholeNumber: boolean;
  inputTypeValue = 'decimal'
  action$: Observable<IPOSOrder>;
  negativeOption: boolean;

  constructor(
      public authenticationService: AuthenticationService,
      public platFormService      : PlatformService,
      private orderMethodsService : OrderMethodsService,
      private _fb                 : UntypedFormBuilder,
      private posOrderItemMethodsService: PosOrderItemMethodsService,
      private siteService: SitesService,
      private dialogRef           : MatDialogRef<PosOrderItemEditComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    if (this.authenticationService.isAdmin || this.authenticationService.isAuthorized) {
      this.negativeOption = true;
    }

    this.authenticationService.userAuths$.subscribe(data => {
      if (data?.allowBuy) {
        this.negativeOption = true
      }
    })

    this.decimals = 2
    if (data) {

      this.instructions = data.instructions
      this.editField    = data.editField
      this.posOrderItem = data.orderItem;
      this.menuItem     = data.menuItem 
      this.requireWholeNumber  = data.requireWholeNumber
      if (this.editField == 'quantity') {
        if (this.menuItem && this.menuItem.itemType) {
          this.requireWholeNumber = this.menuItem.itemType?.requireWholeNumber;
        }
      }
      if (!this.requireWholeNumber) {
        this.decimals = 2
      }
    }
    
    console.log('keypad', data, this.requireWholeNumber)
    this.initForm();

  }

  initForm() {
    if (this.posOrderItem) {
      this.initValueType()

      if (this.editField === 'itemPerDiscount') {
        this.inputForm = this._fb.group({
          itemPercentDiscount: [this.posOrderItem.itemPercentageDiscountValue],
          itemName: [],
        })
      }
      
      if (this.editField == 'modifierNote') {
        this.inputForm = this._fb.group({
          modifierNote: [this.posOrderItem.modifierNote],
        })
      }

      if (this.editField == 'quantity') {
        this.inputForm = this._fb.group({
          quantity: [this.posOrderItem.quantity],
          itemName: [],
        })
      }

      if (this.editField == 'price' || this.editField == 'retail')  {
        this.inputForm = this._fb.group({
          quantity: [this.posOrderItem.quantity],
          itemName: [],
          price   : [this.posOrderItem.unitPrice]
        })
      }

      if (this.editField == 'subTotal') {
        this.inputForm = this._fb.group({
          subTotal: [this.posOrderItem.subTotal],
          itemName: [],
        })
      }

      if (this.editField == 'wholeSale') {
        this.inputForm = this._fb.group({
          wholeSale: [this.posOrderItem.wholeSale],
          itemName: [],
        })
      }

      if (this.editField == 'wholeSaleCost') {
        this.inputForm = this._fb.group({
          wholeSaleCost: [this.posOrderItem.wholeSaleCost],
          itemName: [],
        })
      }

      if (this.editField == 'serialCode') {
        this.inputForm = this._fb.group({
          quantity: [this.posOrderItem.serialCode],
          itemName: [],
        })
      }

  

    }
  }

  initValueType() {
    if (!this.menuItem) {
      this.decimals = 2
      return
    }

    if (this.editField == 'quantity' || this.editField == 'itemPerDiscount') {
      if (this.menuItem?.itemType?.requireWholeNumber || this.requireWholeNumber) {
        this.inputTypeValue = 'number'
        this.decimals = 0
        return
      }

      if (!this.menuItem?.itemType?.requireWholeNumber  || !this.requireWholeNumber) {
        this.inputTypeValue = 'decimal'
        this.decimals = 2
        return
      }
    }

    //itemPerDiscount

  }

  saveChange(event) {
    const item = this.getItemValue();
    item.quantity = event;
    this.action$ = this.saveSub(item, this.editField).pipe(switchMap(data => {
      // this.orderMethodsService.updateOrder(data)
      this.orderMethodsService.updateOrderSubscription(data)
      this.onCancel();
      return of(data)
    }))
  }

  savePriceChange(event) {
    const item =   this.setItemValue(event);
    this.action$ = this.saveSub(item, this.editField)
  }

  saveCostChange(event) {
    const item = this.getItemValue();
    item.wholeSale = event;
    this.action$ = this.saveSub(item, this.editField)
  }

  save() {
    if (this.posOrderItem) {
      const item = this.getItemValue();
      this.action$ = this.saveSub(item, this.editField).pipe(switchMap(data => {
        this.refreshOrderAndClose(data)
        return of(data)
      }))
    }
  }

  refreshOrderAndClose(data) {
    if (!data) {
      this.onCancel();
    }
    if (data?.resultMessage) {
      this.siteService.notify(data?.resultMessage, 'Close', 3000, 'red')
    }

    console.log('id', this.orderMethodsService.getEmployeeID())

    this.orderMethodsService.updateOrder(data)
    this.onCancel();
  }

  saveSub(item: PosOrderItem, editField: string): Observable<IPOSOrder> {
    const order$ = this.posOrderItemMethodsService.saveSub(item, editField).pipe(
      switchMap(data => {
        this.refreshOrderAndClose(data)
        return of(data)
      }
    ))
    return order$
  }

  setItemValue(value: number) {
    let item = this.posOrderItem;

    if (this.editField === 'quantity') {
      item.quantity = value;
    }

    if (this.editField === 'price') {
      item.unitPrice = value;
    }

    if (this.editField === 'subTotal') {
      item.subTotal = value;
    }

    if (this.editField === 'wholeSaleCost') {
      item.wholeSaleCost = value;
    }

    if (this.editField === 'wholeSale') {
      item.wholeSaleCost = value;
    }

    if (this.editField=='itemPerDiscount') { 
      item.itemPercentageDiscountValue = value;
    }

    return item
  }

  getItemValue() {
    let item = this.posOrderItem;

    if (this.editField === 'modifierNote') {
      const value = this.inputForm.controls['modifierNote'].value;
      item.modifierNote = value;
    }

    if (this.editField === 'quantity') {
      const value = this.inputForm.controls['quantity'].value;
      item.quantity = value;
    }

    if (this.editField === 'price') {
      const value = this.inputForm.controls['price'].value;
      item.unitPrice = value;
    }

    if (this.editField === 'subTotal') {
      const value = this.inputForm.controls['subTotal'].value;
      item.subTotal = value;
    }

    if (this.editField === 'wholeSaleCost') {
      const value = this.inputForm.controls['wholeSaleCost'].value;
      item.wholeSaleCost = value;
      this.posOrderItem.wholeSaleCost = value;
    }

    if (this.editField === 'wholeSale') {
      const value = this.inputForm.controls['wholeSale'].value;
      item.wholeSaleCost = value;
    }

    if (this.editField === 'itemPerDiscount') {
      const value = this.inputForm.controls['itemPerDiscount'].value;
      item.itemPercentageDiscountValue = value;
    }
    // /itemPerDiscount

    return item
  }

  onCancel() {
    this.authenticationService.updateUserAuthstemp(null);
    this.orderMethodsService._scanner.next(true)
    console.log('onCancel')
    this.dialogRef.close();
    this.closeOnEnterPress.emit('true')
  }

  onClose(event) {//
    console.log('press close ')
    this.authenticationService.updateUserAuthstemp(null);
    this.dialogRef.close();
    this.closeOnEnterPress.emit('true')
  }
}


