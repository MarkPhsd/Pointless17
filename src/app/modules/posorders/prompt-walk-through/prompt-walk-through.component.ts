import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {  PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptWalkThroughService } from 'src/app/_services/menuPrompt/prompt-walk-through.service';
import { OrdersService } from 'src/app/_services';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-prompt-walk-through',
  templateUrl: './prompt-walk-through.component.html',
  styleUrls: ['./prompt-walk-through.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PromptWalkThroughComponent implements OnInit {

  action$:          Observable<any>;
  _promptGroup     : Subscription;
  promptGroup      : IPromptGroup

  orderPromptGroup : IPromptGroup;
  _orderPromptGroup: Subscription;

  order            : IPOSOrder;
  _order           : Subscription;

  posItem          : PosOrderItem;
  _posItem         : Subscription;

  intSubscriptions() {
    this.initPOSItemSubscription();
    this.initPromptGroupSubscription();
    this.initOrderPromptGroupSubscription();
  }

  initPOSItemSubscription() {
    this._posItem = this.posOrderItemService.posOrderItem$.subscribe(data => {
      // console.log('initPOSItemSubscription', data)
      this.posItem = data;
    })
  }

  initPromptGroupSubscription() {
    this._promptGroup = this.promptGroupService.promptGroup$.subscribe(data => {
      // console.log('initPromptGroupSubscription', data)
      this.promptGroup = data;
    })
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
    private posOrderItemService      : POSOrderItemServiceService,
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
  }

  reset() {
    // this.orderPromptGroup.prompts.
  }

  close() {
    this.dialogRef.close()
  }

  cancel() {
    //cancel prompt and item being applied to.
    const result = window.confirm("Do you want to cancel this prompt? This will  apply all selections")

    if (result) {

      const site = this.sitesService.getAssignedSite();

      if (this.orderPromptGroup) {

        const item = this.orderPromptGroup.posOrderItem;
        const orderID = this.orderPromptGroup.orderID.toString()

        if (item) {
          this.action$ = this.posOrderItemService.deletePOSOrderItem(site, item.id).pipe(
            switchMap(data => {
              return  this.orderService.getOrder(site, orderID, false)
            }
              )
            ).pipe(
              switchMap( data => {
                this.orderService.updateOrderSubscription(data)
                this.dialogRef.close()
                return of('success')
              }
            )
          )
        }
      }
    }
  }

  applyChoices() {
    if (this.orderPromptGroup) {
      const site = this.sitesService.getAssignedSite();
      const prompt$ = this.posOrderItemService.postPromptItems(site, this.orderPromptGroup);

      this.action$ =  prompt$.pipe(
          switchMap( data  => {
              return  this.orderService.getOrder(site, data.orderID.toString(), false)
             }
          )
          ).pipe(
            switchMap( data => {
            this.dialogRef.close(false)
            this.orderService.updateOrderSubscription(data)
            return of('success')
        })
      )
    }
  }

}

// this.orderService.getOrder(site, this.order.id.toString()).subscribe( data => {
//   this.orderService.updateOrderSubscription(data)
//   console.log('posted')
//   this.dialogRef.close()
