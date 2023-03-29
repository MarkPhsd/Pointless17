import { Component, EventEmitter, Inject, Input, Output, } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MenuService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IonItem } from '@ionic/angular';

@Component({
  selector: 'app-pos-order-item-edit',
  templateUrl: './pos-order-item-edit.component.html',
  styleUrls: ['./pos-order-item-edit.component.scss']
})
export class PosOrderItemEditComponent  {

  @Input() purchaseOrderEnabled: boolean;
  @Output() closeOnEnterPress = new EventEmitter();
  inputForm   : FormGroup;
  posOrderItem: PosOrderItem;
  editField   = 'modifierNote'
  instructions: 'Make changes'
  menuItem    : IMenuItem;
  decimals    = 2;
  requireWholeNumber: boolean;
  inputTypeValue = 'decimal'

  constructor(
      private posOrderItemService : POSOrderItemServiceService,
      private orderService        : OrdersService,
      private siteService         : SitesService,
      private _fb                 : FormBuilder,
      private menuService         : MenuService,
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
    this.updateQuantity(item)
  }

  savePriceChange(event) {
    const item = this.getItemValue();
    if (item){
      this.posOrderItem.unitPrice = event;
      this.inputForm.patchValue({price: event})
      this.save()  
    }
  }

  saveCostChange(event) {
    const item = this.getItemValue();
    item.wholeSale = event;
    this.save()
  }

  save() {
    if (this.posOrderItem) {
      const site = this.siteService.getAssignedSite();
      const item = this.getItemValue();

      if (item && site) {

        if (this.editField == 'quantity') {
          this.updateQuantity(item)
          return
        }

       if (this.editField == 'price') {
          if (item) {
            this.posOrderItemService.changeItemPrice(site, item).subscribe( data => {
              if (data) {
                if (data.resultMessage) {
                  this.siteService.notify(data.resultMessage, 'Alert', 1500)
                }
              }
              this.orderService.updateOrderSubscription(data)
              this.onCancel();
            })
          }
          return
        }

        if (this.editField == 'subTotal') {
          if (item) {
            this.posOrderItem.subTotal = item.unitPrice;
            this.posOrderItemService.changeItemSubTotal(site, item).subscribe( data => {
              if (data) {
                if (data.resultMessage) {
                  this.siteService.notify(data.resultMessage, 'Alert', 1500)
                }
              }
              this.orderService.updateOrderSubscription(data)
              this.onCancel();
            })
          }
          return
        }

        if (this.editField == 'wholeSale') {
          if (item) {
            this.posOrderItemService.changeItemCost(site, item).subscribe( data => {
              if (data) {
                if (data.resultMessage) {
                  this.siteService.notify(data.resultMessage, 'Alert', 1500)
                }
              }
              this.orderService.updateOrderSubscription(data)
              this.onCancel();
            })
          }
          return
        }

        if (this.editField == 'wholeSaleCost') {
          if (item) {
            this.posOrderItemService.changeItemTotalCost(site, item).subscribe( data => {
              if (data) {
                if (data.resultMessage) {
                  this.siteService.notify(data.resultMessage, 'Alert', 1500)
                }
              }
              this.orderService.updateOrderSubscription(data)
              this.onCancel();
            })
          }
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
      const value = this.inputForm.controls['price'].value;
      item.subTotal = value;
      item.wholeSaleCost = value;
    }

    // console.log('get item value', item)
    return item
  }


  onCancel() {
    this.orderService._scanner.next(true)
    this.dialogRef.close();
    this.closeOnEnterPress.emit('true')
  }

  onClose(event) {
    this.dialogRef.close();
    this.closeOnEnterPress.emit('true')
  }
}


