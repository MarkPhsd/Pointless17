import { Component, OnInit, Input,OnDestroy } from '@angular/core';
import { PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPromptGroup, SelectedPromptSubGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { OrdersService } from 'src/app/_services';
import { PromptWalkThroughService } from 'src/app/_services/menuPrompt/prompt-walk-through.service';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { Subscription } from 'rxjs';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'prompt-sub-group-panel',
  templateUrl: './prompt-sub-group-panel.component.html',
  styleUrls: ['./prompt-sub-group-panel.component.scss']
})
export class PromptSubGroupPanelComponent implements OnInit, OnDestroy {
  subGroups        : SelectedPromptSubGroup[]
  @Input() phoneDevice: boolean;
  _promptGroup     : Subscription;
  promptGroup      : IPromptGroup

  _accordionStep     : Subscription;
  accordionStep      : number

  orderPromptGroup : IPromptGroup;
  _orderPromptGroup: Subscription;

  posItem          : PosOrderItem;
  _posItem         : Subscription;

  order            : IPOSOrder;
  _order           : Subscription;

  intSubscriptions() {

    this._order = this.orderMethodsService.currentOrder$.subscribe(data => {
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

        if (!this.promptWalkService.accordionStep) {
          this.promptWalkService.updateAccordionStep(0)
        } else {
          this.accordionStep       = this.promptWalkService.accordionStep
        }
        // console.log('accordion from parent updated', this.accordionStep)
      }
    })

    this._accordionStep = this.promptWalkService.accordionStep$.subscribe( data => {


      this.accordionStep = data;
    })
  }

  constructor(
    private sitesService             : SitesService,
    private orderService             : OrdersService,
    public orderMethodsService       : OrderMethodsService,
    private promptGroupService       : PromptGroupService,
    private posOrderItemService      : POSOrderItemService,
    private promptWalkService        : PromptWalkThroughService,
    )
  {
    this.intSubscriptions()
    this.subGroups = this.promptGroup.selected_PromptSubGroups
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.promptWalkService.updateAccordionStep(0)
  }
  ngOnInit(): void {
    // console.log('')
  }

  setStep(event) {
    this.accordionStep = event;
  }

}
