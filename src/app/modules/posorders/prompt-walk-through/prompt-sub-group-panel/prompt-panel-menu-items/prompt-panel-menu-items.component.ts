import { Component, OnInit, Input, Output , EventEmitter, ChangeDetectionStrategy,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild} from '@angular/core';
import { IPromptSubResults, MenuSubPromptSearchModel, PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { editWindowState, IPromptResults, MenuPromptSearchModel, PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { PromptSubGroups, SelectedPromptSubGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptWalkThroughService } from 'src/app/_services/menuPrompt/prompt-walk-through.service';
import { AWSBucketService } from 'src/app/_services';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'prompt-panel-menu-items',
  templateUrl: './prompt-panel-menu-items.component.html',
  styleUrls: ['./prompt-panel-menu-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromptPanelMenuItemsComponent implements OnInit {
  @ViewChild('promptMenuItemView')     promptMenuItemView: TemplateRef<any>;

  @Input() selectedSubGroup       : SelectedPromptSubGroup;
  @Input() subGroup               : PromptSubGroups;
  @Input() index                  : number;
  panelIndex                      = 0;

  _accordionStep               : Subscription;
  @Input()  accordionStep      : number
  itemOption                   = 1;
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
  itemOptions = [
    {name: 'whole', id: 1},
    {name: 'LFT 1/2', id: 2},
    {name: 'RT 1/2', id: 3},
    {name: 'No', id: 4},
  ]

  initPOSItemSubscriber() {
    this._posItem = this.posOrderItemService.posOrderItem$.subscribe(data => {
      this.posItem = data;
    })
  }

  resetItemOption(event) {
    this.itemOption = 1;
  }

  initPromptSubscriber() {
      this._orderPromptGroup  = this.promptWalkService.orderPromptGroup$.subscribe( data => {
        this.orderPromptGroup = data;

        if (this.orderPromptGroup)
        {
          this.panelIndex       = this.orderPromptGroup.currentAccordionStep
        }
    })
  }

  initAccordionSubscriber() {
    this._accordionStep = this.promptWalkService.accordionStep$.subscribe( data => {
      this.accordionStep = data;
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
    private posOrderItemService      : POSOrderItemService,
    private promptWalkService        : PromptWalkThroughService,
    private awsBucket                : AWSBucketService,
  ) {
  }

  async ngOnInit() {
    if (this.subGroup) {

      this.subGroup.promptMenuItems = this.subGroup.promptMenuItems.filter(data => {
        if(data.prompt_Products) {
          return data
        }
      })
      this.resetHideOptions()
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

  resetHideOptions() {
    if (this.subGroup.hideSplitOptions) {
      this.itemOptions = [
        {name: 'No', id: 4},
      ]
      return;
    }
    if (!this.subGroup.hideSplitOptions) {
      this.itemOptions = [
        {name: 'whole', id: 1},
        {name: 'LFT 1/2', id: 2},
        {name: 'RT 1/2', id: 3},
        {name: 'No', id: 4},
      ]
      return;
    }
  }

  getItemSrc(prompt_Products) {
    if (!this.subGroupInfo || !this.subGroupInfo.image) {
      } else {
      return this.awsBucket.getImageURLPath(this.bucketName, this.subGroupInfo.image)
    }
  }

  setOption(event) {
    this.itemOption = event
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
    this.promptWalkService.updateAccordionStep(index);
  }

  getPromptItemView(item) {
    if (item &&
        item.prompt_Products &&
        item.prompt_Products.name &&
        item.prompt_Products.name != '') {

      return this.promptMenuItemView;
    }
    return null;
  }
}
