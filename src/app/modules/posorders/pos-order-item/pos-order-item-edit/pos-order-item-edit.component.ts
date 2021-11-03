import { Component, Inject, } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
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
  // menuItem    : IMenuItem;

  constructor(
      private posOrderItemService : POSOrderItemServiceService,
      private orderService        : OrdersService,
      private siteService         : SitesService,
      private _fb                 : FormBuilder,
      private dialogRef           : MatDialogRef<PosOrderItemEditComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    if (data) {
      console.log(data)
      this.instructions = data.instructions
      this.editField    = data.editField
      this.posOrderItem = data.orderItem;
      // this.menuItem     = data.menuItem;
    }
    this.initForm();

  }

  initForm() {
    if (this.posOrderItem) {

      if (this.editField == 'modifierNote') {
        this.inputForm = this._fb.group({
          modifierNote: [this.posOrderItem.modifierNote],
        })
      }

      if (this.editField == 'quantity') {
        this.inputForm = this._fb.group({
          quantity: [this.posOrderItem.quantity],
        })
      }

    }
  }

  save() {
    if (this.posOrderItem) {
      const site = this.siteService.getAssignedSite();
      const item = this.getItemValue();
      if (item && site) {

        console.log('thismenuItem.')
        if (this.editField == 'quantity'  ) {
            this.posOrderItemService.changeItemQuantity(site, item ).subscribe( data => {
            this.orderService.updateOrderSubscription(data)
            this.onCancel();
          })
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
