import { Component, OnInit, Input, Output , EventEmitter, ChangeDetectionStrategy,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild} from '@angular/core';
import {PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { IPromptSubProperites, PromptSubGroups, SelectedPromptSubGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptWalkThroughService } from 'src/app/_services/menuPrompt/prompt-walk-through.service';
import { AWSBucketService, IItemBasic } from 'src/app/_services';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { PromptPanelMenuItemComponent } from './prompt-panel-menu-item/prompt-panel-menu-item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'prompt-panel-menu-items',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    PromptPanelMenuItemComponent,FormsModule,ReactiveFormsModule,
  ],
  templateUrl: './prompt-panel-menu-items.component.html',
  styleUrls: ['./prompt-panel-menu-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromptPanelMenuItemsComponent implements OnInit {
  @ViewChild('promptMenuItemView')     promptMenuItemView: TemplateRef<any>;

  // itemPropertyList : string[]
  itemPropertySelected: string;

  @Input() selectedSubGroup       : SelectedPromptSubGroup;
  @Input() subGroup               : PromptSubGroups;
  @Input() index                  : number;
  @Input() phoneDevice            : boolean;
  panelIndex                      = 0;

  _accordionStep               : Subscription;
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
  itemSelected = {} as IItemBasic
  itemOption      :number = 1;
  itemOptions = [
    {name: 'whole', id: 1},
    {name: 'LFT 1/2', id: 2},
    {name: 'RT 1/2', id: 3},
    {name: 'No', id: 4},
  ]
  androidApp: boolean;

  get itemPropertyList() {
    if (this.subGroup?.json) {
      const items  =  JSON.parse(this.subGroup?.json) as IPromptSubProperites;
      if (!items.itemModList) { return []}
      const list   = items.itemModList.split(',')
      return list;
    }
    return []
  }

  initPOSItemSubscriber() {
    this._posItem = this.posOrderItemService.posOrderItem$.subscribe(data => {
      this.posItem = data;
    })
  }

  setItem(item) {
    this.itemOption = item
  }

  // resetItemOption(event) {
  //   this.itemOption = {name: 'whole', id: 1} as IItemBasic;
  // }

  resetItemOption(event) {
    this.itemOption = 1 //{name: 'whole', id: 1} as IItemBasic;
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
    private posOrderItemService      : POSOrderItemService,
    private promptWalkService        : PromptWalkThroughService,
    private awsBucket                : AWSBucketService,
    private platFormService: PlatformService,
  ) {
  }

  async ngOnInit() {
    this.androidApp = this.platFormService.androidApp
    if (this.subGroup) {

      this.subGroup.promptMenuItems = this.subGroup.promptMenuItems.filter(data => {
        if(data.prompt_Products) {
          return data
        }
      })
      this.resetHideOptions()
    }
    this.bucketName =   await this.awsBucket.awsBucket();
    if (this.subGroupInfo && this.subGroupInfo.image) {
      this.imageURL = this.getItemSrc(this.subGroupInfo.image)
    }
    this.intSubscriptions();
  }

  addtoDescriptionsItems(event) {
    if (event === 'clear') {
      this.itemPropertySelected = null
      return
    }
    if (! this.itemPropertySelected) { this.itemPropertySelected =''}
    this.itemPropertySelected = this.itemPropertySelected + ' ' + event
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

  clearSelectedItem(event) {
    this.itemPropertySelected = null;
  }
}
