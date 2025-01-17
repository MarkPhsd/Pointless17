import { Component,  Inject,  Input, Output, OnInit, Optional,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable} from 'rxjs';
// import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
// import { AgGridService } from 'src/app/_services/system/ag-grid-service';
// import 'ag-grid-community/dist/styles/ag-theme-material.css';
// import { Capacitor, Plugins } from '@capacitor/core';
import { MenuSubPromptSearchModel, PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { IPromptResults, MenuPromptSearchModel, PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { PromptSubGroups, SelectedPromptSubGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { IListBoxItem, IItemsMovedEvent } from 'src/app/_interfaces/dual-lists';
import { moveItemInArray, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'prompt-associations',

  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    FormsModule,ReactiveFormsModule,
  ],

  templateUrl: './prompt-sub-group-association.component.html',
  styleUrls: ['./prompt-sub-group-association.component.scss']
})
export class PromptSubGroupAssociationComponent implements OnInit {

  @Input() valueField = 'id';
  // field to use for displaying option text
  @Input() textField = 'name';
  // text displayed over the available items list box
  @Input() availableText = 'Available items';
  // text displayed over the selected items list box
  @Input() selectedText = 'Selected items';
  // set placeholder text in available items list box
  @Input() availableFilterPlaceholder = 'Filter...';
  // set placeholder text in selected items list box
  @Input() selectedFilterPlaceholder = 'Filter...';
  // event called when items are moved between boxes, returns state of both boxes and item moved
  @Output() itemsMoved: EventEmitter<IItemsMovedEvent> = new EventEmitter<IItemsMovedEvent>();

  // array of items to display in left box
  @Input() set availables(items: Array<{}>) {
    this.availableItems = [...(items || []).map((item: {}, index: number) => ({
      value: item[this.valueField].toString(),
      text: item[this.textField],
      groupID: 0,
    }))];
  }
  // array of items to display in right box
  @Input() set selects(items: Array<{}>) {
    this.selectedItems = [...(items || []).map((item: {}, index: number) => ({
      value: item[this.valueField].toString(),
      text: item[this.textField],
      groupID: 0,
    }))];
  }

  //useGroups lists on the left.
  promptResults$   : Observable<IPromptResults>;
  subGroups        : PromptSubGroups[];
  subGroupID       : number;
  promptGroupsID   : number;
  promptGroup      : IPromptGroup;
  assignedStatic   : any;
  allAssigned      : any;

  availableItems: Array<IListBoxItem> = [];
  selectedItems : Array<IListBoxItem> = [];
  listBoxForm   : UntypedFormGroup;

  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  searchModel: MenuPromptSearchModel;

  rowData:               any[];
  pageSize                = 20
  currentRow              = 1;
  currentPage             = 1
  numberOfPages           = 1
  startRow                = 0;
  endRow                  = 0;
  recordCount             = 0;
  isfirstpage             = 0;
  islastpage              = 0;

  id             : number;
  prompt         : PromptSubGroups;

  constructor(  private _snackBar              : MatSnackBar,
                private promptSubService       : PromptSubGroupsService,
                private promptGroupService     : PromptGroupService,
                private fb                     : UntypedFormBuilder,
                private siteService            : SitesService,
                )
  {
    this.listBoxForm = this.fb.group({
      availableSearchInput: [''],
      selectedSearchInput: [''],
    });
  }

  ngOnInit() {
    this.refreshGroups()
  }


  // only call this when the prompt is selected.
  // pass the prompt, this will show the
  //Group Types that have been assigned on the right, and the prompts that
  //can be assigned on the left.
  //the groups that are assigned will be used to remove from the groups that are avalible.
  async refreshAssignment(id: number) {
    const site     = this.siteService.getAssignedSite()
    const prompts$ = this.promptGroupService.getPrompt(site, id)
    const prompts = await prompts$.pipe().toPromise();
    // prompts$.subscribe(prompts => {
    if (prompts) {
      //then we have each group assisnged from the prompts.
      // console.log('prompt', prompts)
      this.assignSelectedAndAvalible(prompts.selected_PromptSubGroups)
    }

  }

  refreshGroups() {
    const site = this.siteService.getAssignedSite()
    const searchModel = {} as MenuPromptSearchModel
    searchModel.pageSize = 100;
    searchModel.pageNumber = 1
    this.promptResults$ = this.promptGroupService.searchMenuPrompts(site, searchModel)
    this.availableItems = [];
    this.selectedItems  = [];
  }

  async assignSelectedAndAvalible(selectedGroups: SelectedPromptSubGroup[]) {
    //get avalible Sub Prompts that are created.
    const searchModel      = {} as MenuSubPromptSearchModel
    searchModel.pageNumber = 1
    searchModel.pageSize   = 200;
    const site             = this.siteService.getAssignedSite()
    const results          = await this.promptSubService.searchSubPrompts(site, searchModel).pipe().toPromise();
    const allGroups        = results.results;

    if (selectedGroups.length > 0) {
      const groups = selectedGroups
      //for each of these, we can remove matching item from the avalble list.  //avalible
      //Also we assign the in useGroupTaxes to the assigned list. //selected
      this.selectedItems = []
      groups.forEach(data => {
        if (data && data.promptSubGroups) {
          this.selectedItems.push({groupID: 0,value: data.promptSubGroupsID.toString(), text: data.promptSubGroups.name})
        }
      })
      this.removeSelectedFromAvailable(allGroups, groups)
      return
    }

    if (selectedGroups.length == 0) { }
    this.removeSelectedFromAvailable(allGroups, undefined)
  }

  _assignSelectedAndAvalible(selectedGroups: SelectedPromptSubGroup[]) {
    //get avalible Sub Prompts that are created.
    const searchModel      = {} as MenuSubPromptSearchModel
    searchModel.pageNumber = 1
    searchModel.pageSize   = 200;
    const site             = this.siteService.getAssignedSite()
    if (selectedGroups.length > 0) {
      this.promptSubService.searchSubPrompts(site, searchModel).subscribe(
        {
          next: data => {
            if (data) {
              const allGroups        = data.results;
              // console.log('allgroups', allGroups )
              // console.log(', selectedGroups.length', selectedGroups.length)
              if (selectedGroups.length > 0) {
                const groups = selectedGroups
                //for each of these, we can remove matching item from the avalble list.  //avalible
                //Also we assign the in assogmed items  to the assigned list.             //selected
                this.selectedItems = []
                groups.forEach(data => {
                  if (data && data.promptSubGroups) {
                    this.selectedItems.push({groupID: 0,value: data.promptSubGroupsID.toString(), text: data.promptSubGroups.name})
                  }
                })
                this.removeSelectedFromAvailable(allGroups, groups)
                return
              }
              if (selectedGroups.length == 0) { }
              this.removeSelectedFromAvailable(allGroups, undefined)
          }},
          error: err => {
            if (selectedGroups.length == 0) { }
            this.removeSelectedFromAvailable(undefined, undefined)
            return;
          }
        }
      )
    }
  }

  setPromptItem(item) {
    console.log('setPromptItem', item)
  }

  removeSelectedFromAvailable( xallGroups: PromptSubGroups[], xallAssignedGroups: SelectedPromptSubGroup[]): IListBoxItem[]   {

    if ( !xallGroups ) { return }

    let allGroups  = xallGroups.map( item =>  ({ groupID: 0,value: item.id.toString(), text: item.name }));

    if (xallAssignedGroups != undefined) {
      let allAssignedGroups   = xallAssignedGroups.map( item =>
         ({groupID: 0, value: item.promptSubGroupsID.toString(), text: item.promptSubGroups?.name.toString() })
      );

      if (allAssignedGroups) {
        allAssignedGroups.forEach(item => {
          const value = allGroups.find( x => x.text.toLowerCase() === item.text.toLowerCase() )
          if (value) {
            allGroups = allGroups.filter(item => item !== value)
          }
        })
      }
      if (allAssignedGroups != undefined) {
        allGroups =  allGroups.filter(item => !allAssignedGroups.includes(item));
      }
      // return;
    }

    // if (!xallAssignedGroups) {
      this.refreshUnselected(allGroups)
      return allGroups;
    // }

  }

  refreshUnselected(allGroups) {
     this.availableItems  = allGroups //.map( item =>          ({ value: item.value.toString(), text: item.name }));
  }

  //we are saving the Whole List of assigned or
  //we are saving the added.
  // i feel like it's easier to push the whole list,
  //and keep a reference to the selecteditems, then push the whole list.
  saveAssignedGroups() {
    const site = this.siteService.getAssignedSite()
    const promptID = this.promptGroupsID;
    if (promptID && this.promptGroup) {
      let useGroups = {} as SelectedPromptSubGroup[]
      const selected = this.selectedItems
      const promptSubGroups = {} as PromptSubGroups
      if (selected) {
        // selected.forEach( item => { useGroups.push( { id:0, taxID: taxID, useGroupID: parseInt(item.value)  }) })
        useGroups = selected.map(item => ({ sortOrder: 0,
                                            id: 0,
                                            promptSubGroupsID: parseInt(item.value),
                                            promptGroupsID: promptID,
                                            promptSubGroups: promptSubGroups  }
                                         ));
        //push the list even if it's undefined. This way the list will be deleted if no items are assigned to it.
        this.promptGroup.selected_PromptSubGroups = useGroups
        const groups$ = this.promptGroupService.saveList(site,  this.promptGroup)
        groups$.subscribe( data => {
          console.log('saved')
        })
      }
    }
  }

  // promptGroupsID:    number;
  // promptSubGroupsID: number;
  // id:                number;
  // promptSubGroups:   PromptSubGroups;
  convertToIlistBoxItem(listSource: any[]): IListBoxItem[] {
    var result = listSource.map(item => ({groupID: 0, value: item.id.toString(), text: item.name }));
    return result
  }

  setItemType(event) {
    this.promptGroup = event;
    this.promptGroupsID = this.promptGroup.id;
    this.selectedItems =[]
    this.refreshAssignment(this.promptGroupsID)
  }

  drop(event: CdkDragDrop<IListBoxItem[]>) {

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }

    // clear marked available items and emit event
    //assign the selected items to the current itemType selected.
    // this.assignArrayToItemType(this.selectedItems)
    this.saveAssignedGroups()
    return
    this.itemsMoved.emit({
      available: this.availableItems,
      selected: this.selectedItems,
      movedItems: event.container.data.filter((v, i) => i === event.currentIndex),
      from: 'available',
      to  : 'selected',
    });
  }

  searchItemsReset() {
    // this.pageSize = 1
    // const site = this.siteService.getAssignedSite()
    // const productSearchModel = this.initProductSearchModel(this.search);
    // this.menuItems$ = this.menuService.getProductsBySearchForLists(site, productSearchModel)
  }
}

