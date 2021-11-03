import { Component, OnInit, Input } from '@angular/core';
import { IPromptSubResults, MenuSubPromptSearchModel, PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { editWindowState, IPromptResults, MenuPromptSearchModel, PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { PromptSubGroups } from 'src/app/_interfaces/menu/prompt-groups';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPromptGroup, SelectedPromptSubGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { OrdersService } from 'src/app/_services';
import { PromptWalkThroughService } from 'src/app/_services/menuPrompt/prompt-walk-through.service';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { Subscription } from 'rxjs';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';

@Component({
  selector: 'prompt-sub-group-panel',
  templateUrl: './prompt-sub-group-panel.component.html',
  styleUrls: ['./prompt-sub-group-panel.component.scss']
})
export class PromptSubGroupPanelComponent implements OnInit {
  initialStep      = 0
  accordionStep    = 0

  subGroups        : SelectedPromptSubGroup[]

  _promptGroup     : Subscription;
  promptGroup      : IPromptGroup

  orderPromptGroup : IPromptGroup;
  _orderPromptGroup: Subscription;

  posItem          : PosOrderItem;
  _posItem         : Subscription;

  order            : IPOSOrder;
  _order           : Subscription;

  intSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe(data => {
      this.order = data;
    })

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
    this._orderPromptGroup     = this.promptWalkService.orderPromptGroup$.subscribe( data => {
      this.orderPromptGroup    = data;
      if (this.orderPromptGroup) {
        this.accordionStep       = this.orderPromptGroup.currentAccordionStep
        console.log('accordion from parent updated', this.accordionStep)
      }
    })
  }

  constructor(
    private sitesService             : SitesService,
    private orderService             : OrdersService,
    private promptGroupService       : PromptGroupService,
    private posOrderItemService      : POSOrderItemServiceService,
    private promptWalkService        : PromptWalkThroughService,
    )
  {
    this.intSubscriptions()
    this.subGroups = this.promptGroup.selected_PromptSubGroups
    // this.subGroups[0].promptSubGroups.name
  }

  ngOnInit(): void {
    console.log('')
  }



}
