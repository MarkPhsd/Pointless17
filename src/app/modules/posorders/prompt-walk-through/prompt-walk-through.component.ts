import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {  PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptWalkThroughService } from 'src/app/_services/menuPrompt/prompt-walk-through.service';
import { OrdersService } from 'src/app/_services';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { of, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-prompt-walk-through',
  templateUrl: './prompt-walk-through.component.html',
  styleUrls: ['./prompt-walk-through.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PromptWalkThroughComponent implements OnInit {

  @ViewChild('buttonDisplay')    buttonDisplay: TemplateRef<any>;

  _savePrompt: Subscription

  modifierNote     : string;
  processing       : boolean;
  action$:          Observable<any>;
  _promptGroup     : Subscription;
  promptGroup      : IPromptGroup

  orderPromptGroup : IPromptGroup;
  _orderPromptGroup: Subscription;

  order            : IPOSOrder;
  _order           : Subscription;

  posItem          : PosOrderItem;
  _posItem         : Subscription;
  smallDevice: boolean;
  phoneDevice: boolean;

  intSubscriptions() {
    this.initPOSItemSubscription();
    this.initPromptGroupSubscription();
    this.initOrderPromptGroupSubscription();
  }

  initPOSItemSubscription() {
    this._posItem = this.posOrderItemService.posOrderItem$.subscribe(data => {
      console.log('working on:', data.productName)
      this.posItem = data;
    })
  }

  initSaveSubscription() {
    this._savePrompt = this.promptWalkThroughService.savePromptSelection$.subscribe(data => {
      if (data) {
        this.applyChoices()
      }
    })
  }

  initPromptGroupSubscription() {
    try {
      this._promptGroup = this.promptGroupService.promptGroup$.subscribe(data => {
        console.log('working with prompt:', data.name)
        this.promptGroup = data;
      })
    } catch (error) {
    }

    try {
      this._order = this.orderService.currentOrder$.subscribe(data => {
        this.order = data;
      })
    } catch (error) {
    }
    //this should be initialized from selecting an item earlier.
    //the order and the prompt will be assigned.
    //the main item should also be included .
    //we might in the future want to use a multiplier. based on size selection
  }

  initOrderPromptGroupSubscription() {
    //this should be initialized from selecting an item earlier.
    //the order and the prompt will be assigned.
    //the main item should also be included .
    //we might in the future want to use a multiplier. based on size selection
    this._orderPromptGroup = this.promptWalkThroughService.orderPromptGroup$.subscribe( data => {
      // console.log('initOrderPromptGroupSubscription', data)
      this.orderPromptGroup = data;
    })

  }

  constructor(
    private sitesService             : SitesService,
    private posOrderItemService      : POSOrderItemService,
    private orderService             : OrdersService,
    private promptGroupService       : PromptGroupService,
    private promptWalkThroughService : PromptWalkThroughService,
    private dialogRef                : MatDialogRef<PromptWalkThroughComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    )
  {
  }

  ngOnInit(): void {
    this.intSubscriptions()
    this.updateScreenSize()
    this.initSaveSubscription()
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.smallDevice = false
    this.phoneDevice = false;
    if ( window.innerWidth < 811 ) {
      this.smallDevice = true
    }
    if ( window.innerWidth < 600 ) {
      this.phoneDevice = true
    }
  }


  reset() {
    // this.orderPromptGroup.prompts.
    // this.orderPromptGroup.
  }

  close() {
    this.dialogRef.close()
  }

  getItem() {
    if (!this.orderPromptGroup) {
      return this.posItem;
    }

    if (this.orderPromptGroup) {
      return this.orderPromptGroup.posOrderItem;
    }
  }

  getOrderID() {
    if (!this.orderPromptGroup) {
      if (!this.posItem) { return 0}
      return this.posItem.orderID;
    }

    if (this.orderPromptGroup) {
      return this.orderPromptGroup.orderID;
    }
  }

  cancel() {
    //cancel prompt and item being applied to.
    const result = window.confirm("Do you want to cancel this prompt? This will  apply all selections")

    if (result) {
      const site = this.sitesService.getAssignedSite();
      let orderID = this.getOrderID()
      console.log(orderID)
      if (orderID == 0) {
        this.dialogRef.close('success')
        return;
      }
      const item = this.getItem();
      if (!item) {
        this.dialogRef.close('success')
        return
      }
      console.log(item?.orderID, item);
      if (item) {
        this.action$ = this.posOrderItemService.deletePOSOrderItem(site, item.id).pipe(
          switchMap(data => {
            return  this.orderService.getOrder(site, orderID.toString(), false)
             }
          )).pipe(
            switchMap( data => {
              this.orderService.updateOrderSubscription(data)
              this.dialogRef.close('success')
              return of('success')
            }
          )
        )
      }

    }
  }


  get  largeScreenButtons(){
    if (!this.phoneDevice) {
      return this.buttonDisplay;
    }
  }

  get smallScreenButtons() {
    if (this.phoneDevice) {
      return this.buttonDisplay;
    }
  }

  // @ViewChild('largeDisplay')    largeDisplay: TemplateRef<any>;
  // @ViewChild('smallDisplay')    smallDisplay: TemplateRef<any>;

  applyChoices() {
    if (this.orderPromptGroup) {
      const site = this.sitesService.getAssignedSite();
      this.setNotes();
      const prompt$ = this.posOrderItemService.postPromptItems(site, this.orderPromptGroup);

      this.processing = true;

      this.action$ =  prompt$.pipe(
          switchMap( data  => {
              return  this.orderService.getOrder(site, data.orderID.toString(), false)
             }
          )
          ).pipe(
            switchMap( data => {
              this.processing = false
              this.dialogRef.close(false)
              this.orderService.updateOrderSubscription(data)
              return of('success')
            }),
            catchError(data => {
              this.sitesService.notify(`Error ${data}`, 'Error', 5000, 'red')
              this.processing = false;
              return of('false')
          })
      )
    }
  }

  setNotes() {
    if (this.modifierNote && this.orderPromptGroup.posOrderItem) {
      this.orderPromptGroup.posOrderItem.modifierNote = this.modifierNote;
    }
  }

}


// function catchErrors(arg0: (data: any) => void) {
//   throw new Error('Function not implemented.');
// }
// this.orderService.getOrder(site, this.order.id.toString()).subscribe( data => {
//   this.orderService.updateOrderSubscription(data)
//   console.log('posted')
//   this.dialogRef.close()
