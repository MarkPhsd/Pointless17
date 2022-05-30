import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuService } from 'src/app/_services';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PromptSubGroups, PromptMenuItem } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptMenuItemsService } from 'src/app/_services/menuPrompt/prompt-menu-items.service';
import { PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';

@Component({
  selector: 'prompt-selected-items',
  templateUrl: './prompt-selected-items.component.html',
  styleUrls: ['./prompt-selected-items.component.scss']
})
export class PromptSelectedItemsComponent implements OnInit,OnDestroy {

  promptSubGroup    : PromptSubGroups;
  promptMenuItems   :  PromptMenuItem[];
  promptMenuItem    :  PromptMenuItem;

  _promptSubGroup   : Subscription;
  index             : number;

  initSubscriptions() {
   this._promptSubGroup = this.promptSubGroupService.promptSubGroup$.subscribe(data => {
     if (data) {
      this.promptSubGroup = data;
      if (data.promptMenuItems) {
        this.promptMenuItems = data.promptMenuItems;
      }
    }
   })
  }

  constructor(private promptItems: PromptMenuItemsService,
              private promptSubGroupService: PromptSubGroupsService,
              private siteService:  SitesService,
              private _snackBar:    MatSnackBar){
  }

  ngOnInit() {
    this.initSubscriptions();
    this.initList();
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._promptSubGroup){this._promptSubGroup.unsubscribe()}
  }

  assignItem(item,index) {
    this.promptMenuItem = item
    this.index = index
  }

  deleteSelected() {
    if (!this.index && !this.promptMenuItem) {return}
    const site = this.siteService.getAssignedSite();
    this.promptItems.deleteMenuItemSelected(site, this.promptMenuItem.id).subscribe( data=> {
      this.promptMenuItems.splice( this.index, 1);
      this.promptSubGroup.promptMenuItems = this.promptMenuItems;
    })
    this.promptMenuItem = {} as PromptMenuItem
  }

  initList() {
    if (this.promptSubGroup) {
      this.promptMenuItems = this.promptSubGroup.promptMenuItems
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.promptMenuItems, event.previousIndex, event.currentIndex);
    this.saveMenu()
  }

  saveMenu() {
    const site = this.siteService.getAssignedSite();
    if (this.promptMenuItems) {
      this.promptItems.postItemList(site, this.promptMenuItems).subscribe( data=> {

      })
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  assignType(id: number) {

  }


}
