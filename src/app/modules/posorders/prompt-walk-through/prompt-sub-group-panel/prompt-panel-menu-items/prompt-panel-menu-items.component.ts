import { Component, OnInit, Input, Output , EventEmitter, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { IPromptSubResults, MenuSubPromptSearchModel, PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { editWindowState, IPromptResults, MenuPromptSearchModel, PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { PromptSubGroups, SelectedPromptSubGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptWalkThroughService } from 'src/app/_services/menuPrompt/prompt-walk-through.service';
import { AWSBucketService } from 'src/app/_services';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'prompt-panel-menu-items',
  templateUrl: './prompt-panel-menu-items.component.html',
  styleUrls: ['./prompt-panel-menu-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromptPanelMenuItemsComponent implements OnInit {

  @Input() selectedSubGroup       : SelectedPromptSubGroup;
  @Input() subGroup               : PromptSubGroups;
  @Input() index                  : number;
  panelIndex                      = 0;

  _accordionStep     : Subscription;
  @Input()  accordionStep      : number

  @Output() outputSetStep  = new EventEmitter();
  @Output() outputNextStep = new EventEmitter();
  @Output() outputPrevStep = new EventEmitter(); //:   EventEmitter<any> = new EventEmitter();

  subGroupInfo     : PromptSubGroups;
  bucketName       : string;
  imageURL         : string;

  posItem          : PosOrderItem;
  _posItem         : Subscription;

  orderPromptGroup : IPromptGroup;
  _orderPromptGroup: Subscription;

  initPOSItemSubscriber() {
    this._posItem = this.posOrderItemService.posOrderItem$.subscribe(data => {
      this.posItem = data;
    })
  }

  initPromptSubscriber() {
      this._orderPromptGroup  = this.promptWalkService.orderPromptGroup$.subscribe( data => {
        this.orderPromptGroup = data;
        if (this.orderPromptGroup)
        {

          //this.accordionStep = data;

          this.panelIndex       = this.orderPromptGroup.currentAccordionStep
          // console.log('this panel update', data.selected_PromptSubGroups[this.index].promptSubGroups.name, this.panelIndex)
        }
    })
  }

  initAccordionSubscriber() {
    this._accordionStep = this.promptWalkService.accordionStep$.subscribe( data => {
      console.log('accordiona data updated', data)
      this.accordionStep = data;
      // this.index = this.accordionStep;
      this.setStep(this.accordionStep)
    })
  }

  intSubscriptions() {
    this.initPOSItemSubscriber()
    this.initPromptSubscriber()
    this.initAccordionSubscriber()
  }

  constructor(
    private promptGroupService       : PromptGroupService,
    private posOrderItemService      : POSOrderItemServiceService,
    private promptWalkService        : PromptWalkThroughService,
    private awsBucket                : AWSBucketService,
  ) {
  }

  async ngOnInit() {
    if (this.subGroup) {
      // this.subGroup.promptSubGroups.name
      // this.subGroup.promptSubGroups.promptMenuItems
      // this.subGroupInfo = this.subGroup.promptSubGroups
    }
    this.bucketName =   await this.awsBucket.awsBucket();
    if (this.subGroupInfo && this.subGroupInfo.image) {
      this.imageURL = this.getItemSrc(this.subGroupInfo.image)
    }
    this.intSubscriptions();
  }

  getItemSrc(prompt_Products) {
    if (!this.subGroupInfo || !this.subGroupInfo.image) {
      } else {
      return this.awsBucket.getImageURLPath(this.bucketName, this.subGroupInfo.image)
    }
  }

  nextStep(event) {
    this.promptWalkService.nextStep();
  }

  prevStep(event) {
    this.promptWalkService.previousStep()
  }

  setStep(index: number) {
    if (index == this.accordionStep) {
      return true;
    }
    return false;
  }

  setAccordionStep(index) {
    this.promptWalkService.updateAccordionStep(index)
  }
}
