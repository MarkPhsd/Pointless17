import { Component, OnInit, Input  } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PromptSubGroups, PromptMenuItem } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptMenuItemsService } from 'src/app/_services/menuPrompt/prompt-menu-items.service';
import { PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Location } from '@angular/common';

@Component({
  selector: 'prompt-item-selection',
  templateUrl: './prompt-item-selection.component.html',
  styleUrls: ['./prompt-item-selection.component.scss']
})
export class PromptItemSelectionComponent implements OnInit {

  inputForm         : FormGroup;
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
