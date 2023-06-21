import { Component, EventEmitter, Inject, Input, Output, } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MenuService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IonItem } from '@ionic/angular';
import { PosOrderItemMethodsService } from 'src/app/_services/transactions/pos-order-item-methods.service';
import { Observable, of, switchMap } from 'rxjs';
import { InputTrackerService } from 'src/app/_services/system/input-tracker.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

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

  constructor(
      private orderMethodsService : OrderMethodsService,
      private siteService         : SitesService,
      private _fb                 : UntypedFormBuilder,
      private posOrderItemMethodsService: PosOrderItemMethodsService,
      private dialogRef           : MatDialogRef<PosOrderItemEditComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.decimals = 2
    if (data) {

      this.instructions = data.instructions
      this.editField    = data.editField
      this.posOrderItem = data.orderItem;
      this.menuItem     = data.menuItem

      if (this.editField == 'quantity') {
        if (this.menuItem && this.menuItem.itemType) {
          this.requireWholeNumber = this.menuItem.itemType?.requireWholeNumber;
        }
      }
      if (!this.requireWholeNumber) {
        this.decimals = 2
      }
    }
    this.initForm();

  }

  initForm() {
    if (this.posOrderItem) {
      this.initValueType()

      if (this.editField == 'modifierNote') {
        this.inputForm = this._fb.group({
          modifierNote: [this.posOrderItem.modifierNote],
        })
        // this.inputTrackerService.setField(this.inputForm.controls['modifierNote'])
      }

      if (this.editField == 'quantity') {
        this.inputForm = this._fb.group({
          quantity: [this.posOrderItem.quantity],
          itemName: [],
        })
      }

      if (this.editField == 'price') {
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

    if (this.editField == 'quantity') {
      if (this.menuItem?.itemType?.requireWholeNumber) {
        this.inputTypeValue = 'number'
        this.decimals = 0
        return
      }

      if (!this.menuItem?.itemType?.requireWholeNumber) {
        this.inputTypeValue = 'decimal'
        this.decimals = 2
        return
      }
    }
  }

  saveChange(event) {
    const item = this.getItemValue();
    item.quantity = event;
    this.action$ = this.saveSub(item, this.editField).pipe(switchMap(data => {
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
        if (!data) { 
          this.onCancel();
          return of(null)
        }
        this.orderMethodsService.updateOrder(data)
        this.onCancel();
        return of(data)
      }))
    }
  }

  saveSub(item: PosOrderItem, editField: string): Observable<IPOSOrder> {
    const order$ = this.posOrderItemMethodsService.saveSub(item, editField).pipe(
      switchMap(data => {
        if (!data) { 
          this.onCancel();
          return of(null)
        }
        this.orderMethodsService.updateOrder(data)
        this.onCancel();
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
      // item.subTotal = value;s
      item.wholeSaleCost = value;
      this.posOrderItem.wholeSaleCost = value;
      console.log('change item value', value)
    }

    if (this.editField === 'wholeSale') {
      const value = this.inputForm.controls['wholeSale'].value;
      // item.subTotal = value;s
      item.wholeSaleCost = value;
    }

    return item
  }

  onCancel() {
    this.orderMethodsService._scanner.next(true)
    this.dialogRef.close();
    this.closeOnEnterPress.emit('true')
  }

  onClose(event) {
    this.dialogRef.close();
    this.closeOnEnterPress.emit('true')
  }
}


