import { Component, Inject, } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MenuService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';

@Component({
  selector: 'app-pos-order-item-edit',
  templateUrl: './pos-order-item-edit.component.html',
  styleUrls: ['./pos-order-item-edit.component.scss']
})
export class PosOrderItemEditComponent  {

  inputForm   : FormGroup;
  posOrderItem: PosOrderItem;
  editField   = 'modifierNote'
  instructions: 'Make changes'
  menuItem    : IMenuItem;
  decimals    = 2;
  requireWholeNumber: boolean;

  inputValueType = 'decimal'
  constructor(
      private posOrderItemService : POSOrderItemServiceService,
      private orderService        : OrdersService,
      private siteService         : SitesService,
      private _fb                 : FormBuilder,
      private menuService         : MenuService,
      private dialogRef           : MatDialogRef<PosOrderItemEditComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    if (data) {

      this.instructions = data.instructions
      this.editField    = data.editField
      this.posOrderItem = data.orderItem;
      this.menuItem     = data.menuItem

      if (this.menuItem) {
        this.requireWholeNumber = this.menuItem.itemType?.requireWholeNumber
      }
      // if (this.posOrderItem) {
      //   if (this.posOrderItem.productID) {
      //     const site = this.siteService.getAssignedSite();

      //   }
      // }
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
      }

      if (this.editField == 'quantity') {
        this.inputForm = this._fb.group({
          quantity: [this.posOrderItem.quantity],
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
    if (this.menuItem?.itemType?.requireWholeNumber) {
      this.inputValueType = 'number'
      this.decimals = 0
      return
    }
    if (!this.menuItem?.itemType?.requireWholeNumber) {
      this.inputValueType = 'decimal'
      this.decimals = 2
      return
    }
  }
  saveChange(event) {
    console.log('event', event)
    const item = this.getItemValue();
    item.quantity = event;
    this.updateQuantity(item)
  }

  save() {
    if (this.posOrderItem) {
      const site = this.siteService.getAssignedSite();
      const item = this.getItemValue();
      if (item && site) {

        if (this.editField == 'quantity'  ) {
          this.updateQuantity(item)
          return
        }

        if (this.editField == 'modifierNote') {
          this.posOrderItemService.changeModifierNote(site, item ).subscribe( data => {
            this.orderService.updateOrderSubscription(data)
            this.onCancel();
          })
          return
        }
      }
    }
  }

  updateQuantity(item: PosOrderItem) {
    const site = this.siteService.getAssignedSite();
    this.posOrderItemService.changeItemQuantity(site, item ).subscribe( data => {
      this.orderService.updateOrderSubscription(data)
      this.onCancel();
    })
  }

  getItemValue() {
    let item = this.posOrderItem;
    if (this.editField == 'modifierNote') {
      const value = this.inputForm.controls['modifierNote'].value;
      item.modifierNote = value;
    }

    if (this.editField == 'quantity') {
      const value = this.inputForm.controls['quantity'].value;
      item.quantity = value;
    }

    return item
  }


  onCancel() {
    this.dialogRef.close();
  }

}
