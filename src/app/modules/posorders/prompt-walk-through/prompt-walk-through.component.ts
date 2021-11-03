import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { IPromptSubResults, MenuSubPromptSearchModel, PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { editWindowState, IPromptResults, MenuPromptSearchModel, PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { PromptSubGroups } from 'src/app/_interfaces/menu/prompt-groups';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptWalkThroughService } from 'src/app/_services/menuPrompt/prompt-walk-through.service';
import { OrdersService } from 'src/app/_services';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
@Component({
  selector: 'app-prompt-walk-through',
  templateUrl: './prompt-walk-through.component.html',
  styleUrls: ['./prompt-walk-through.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PromptWalkThroughComponent implements OnInit {

  _promptGroup     : Subscription;
  promptGroup      : IPromptGroup

  orderPromptGroup : IPromptGroup;
  _orderPromptGroup: Subscription;

  order            : IPOSOrder;
  _order           : Subscription;

  posItem          : PosOrderItem;
  _posItem         : Subscription;

  intSubscriptions() {

    this._posItem = this.posOrderItemService.posOrderItem$.subscribe(data => {
      this.posItem = data;
    })

    this._promptGroup = this.promptGroupService.promptGroup$.subscribe(data => {
      this.promptGroup = data;
    })
    //this should be initialized from selecting an item earlier.
    //the order and the prompt will be assigned.
    //the main item should also be included .
    //we might in the future want to use a multiplier. based on size selection
    this._orderPromptGroup = this.promptWalkThroughService.orderPromptGroup$.subscribe( data => {
      this.orderPromptGroup = data;
    })

  }

  constructor(
    private sitesService             : SitesService,
    private posOrderItemService      : POSOrderItemServiceService,
    private promptWalkThroughService : PromptWalkThroughService,
    private orderService             : OrdersService,
    private promptGroupService       : PromptGroupService,
    private dialogRef                : MatDialogRef<PromptWalkThroughComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    )
  {
    this.intSubscriptions()
  }

  ngOnInit(): void {
    console.log('')
  }

  reset() {
    // this.orderPromptGroup.prompts.
  }

  cancel() {
    //cancel prompt and item being applied to.
    const result = window.confirm("Do you want to cancel this prompt? This will not apply any selections")
    this.dialogRef.close()
    console.log('delete all items', result)
    if (result) {
      this.dialogRef.close()
    }
    //   //delete all items referencing the item.
    //   console.log('delete all items')
    //   const site = this.sitesService.getAssignedSite();
    //   if (this.orderPromptGroup && this.orderPromptGroup.posOrderItem) {
    //     const postItem = this.orderPromptGroup.posOrderItem;
    //     this.posOrderItemService.deletePOSOrderItem(site, postItem.id).pipe(
    //           switchMap(data => {
    //             return  this.orderService.getOrder(site, postItem.id.toString())
    //           }
    //         )
    //       ).subscribe(data => {
    //         this.orderService.updateOrderSubscription(data)
    //         this.dialogRef.close()
    //     })
    //   }
    // }
  }

  applyChoices() {
    if (this.orderPromptGroup) {
      const site = this.sitesService.getAssignedSite();

      this.posOrderItemService.postPromptItems(site, this.orderPromptGroup).pipe(
            switchMap( data  => {
              return  this.orderService.getOrder(site, data.orderID.toString())
            }
          )
        ).subscribe(data => {
          this.orderService.updateOrderSubscription(data)
          this.dialogRef.close()
      })

    }
  }

}

// this.orderService.getOrder(site, this.order.id.toString()).subscribe( data => {
//   this.orderService.updateOrderSubscription(data)
//   console.log('posted')
//   this.dialogRef.close()
