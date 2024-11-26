import { Component, OnInit, Input ,OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PromptSubGroups, PromptMenuItem } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptMenuItemsService } from 'src/app/_services/menuPrompt/prompt-menu-items.service';
import { PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { CommonModule, Location } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ProductlistviewComponent } from '../../products/productlistview/productlistview.component';
import { PromptSelectedItemsComponent } from './prompt-selected-items/prompt-selected-items.component';

@Component({
  selector: 'prompt-item-selection',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    ProductlistviewComponent,PromptSelectedItemsComponent,
  SharedPipesModule],

  templateUrl: './prompt-item-selection.component.html',
  styleUrls: ['./prompt-item-selection.component.scss']
})
export class PromptItemSelectionComponent implements OnInit,OnDestroy {

  inputForm         : UntypedFormGroup;
  @Input()   prompt : PromptSubGroups;
  id                : any;
  promptMenuItems   : PromptMenuItem[];
  PromptMenuItem    : PromptMenuItem;

  _promptSubGroup   : Subscription;

  initSubscriptions() {
   this._promptSubGroup = this.promptSubGroupService.promptSubGroup$.subscribe(data => {
      this.prompt = data;
   })
  }

  constructor(
              private promptItems: PromptMenuItemsService,
              private promptSubGroupService: PromptSubGroupsService,
              private siteService: SitesService,
              private location:               Location,
  )
  {
    this.initSubscriptions();
  }

  ngOnInit() {
    console.log('')
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._promptSubGroup) { this._promptSubGroup.unsubscribe()}
  }

  goBack() {
    this.location.back();
  }

  assignNewItem(id) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      if (this.prompt) {
        const newItem = {} as PromptMenuItem;
        newItem.promptSubGroupsID = this.prompt.id
        newItem.menuItemID        = id
        this.promptItems.postItem(site, newItem, this.prompt.promptMenuItems).subscribe(data => {
          this.promptMenuItems = data;
          this.prompt.promptMenuItems = data;
          this.promptSubGroupService.updatePromptSubGroup(this.prompt)
        })
      }
    }
  }

}
