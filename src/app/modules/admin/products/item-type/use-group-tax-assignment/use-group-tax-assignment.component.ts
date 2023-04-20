import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { moveItemInArray, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { IListBoxItem, IItemsMovedEvent } from 'src/app/_interfaces/dual-lists';
import { Observable, of ,switchMap} from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IProductCategory, ISite, TaxRate } from 'src/app/_interfaces';
import { UseGroupsService, Taxes, UseGroupTax, UseGroups } from 'src/app/_services/menu/use-groups.service';
import { UseGroupTaxesService } from 'src/app/_services/menu/use-group-taxes.service';
import { TaxesService, UseGroupTaxAssigned, UseGroupTaxAssignedList } from 'src/app/_services/menu/taxes.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-use-group-tax-assignment',
  templateUrl: './use-group-tax-assignment.component.html',
  styleUrls: ['./use-group-tax-assignment.component.scss']
})

export class UseGroupTaxAssignmentComponent implements OnInit {
  // field to use for value of option
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
  processSaving : boolean
  action$: Observable<unknown>;
  processRetrieving : boolean
  saving$: Observable<unknown>;
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
  taxes$           : Observable<TaxRate[]>;
  useGroups        : IProductCategory[];
  useGroupsList    : any[];
  useGroupsList$    : Observable<UseGroups[]>;
  useGroupID       : number;
  taxID            : number;
  taxRate          : TaxRate;
  assignedStatic   : any;
  allAssigned      : any;

  availableItems: Array<IListBoxItem> = [];
  selectedItems : Array<IListBoxItem> = [];
  listBoxForm   : FormGroup;

  constructor(
    private useGroupService   : UseGroupsService,
    private useGroupTaxService: UseGroupTaxesService,
    private taxService        : TaxesService,
    private siteService       : SitesService,
    private matSnack          : MatSnackBar,
    public fb: FormBuilder) {
    this.listBoxForm = this.fb.group({
      availableSearchInput: [''],
      selectedSearchInput: [''],
    });
  }

  ngOnInit() {
    const site = this.siteService.getAssignedSite()
    this.taxes$ = this.taxService.getTaxRates(site);
    this.useGroupsList$ = this.useGroupService.getUseGroupListNoChildren(site).pipe(switchMap(data => { 
      console.log('use group list', data)
      return of(data)
    }))
    // this.resetUseGroups();
  }

  resetUseGroups() {
    ///resetUseGroups
    const site = this.siteService.getAssignedSite()
    const removeItems$ = this.useGroupService.resetUseGroups(site);
    this.useGroupsList$ = removeItems$.pipe(switchMap(data => {
      return of(data)
    }))
  }

  initGroups(site: ISite) {
    return  this.useGroupService.restoreGroups(site)
  }

  // only call this when the tax is selected.
  // pass the taxID, this will show the
  //Group Types that have been assigned on the right, and the taxes that
  //can be assigned on the left.
  //the groups that are assigned will be used to remove from the groups that are avalible.
  refreshTaxAssignment(taxID: number) {
    const site   = this.siteService.getAssignedSite()
    const taxes$ = this.taxService.getTaxRateWithGroups(site, taxID)
    this.processRetrieving = true
    this.action$ =  taxes$.pipe(switchMap(data => {
      this.processRetrieving = false
      if (data) {
        //then we have each group assisnged from the taxes.
        this.assignSelectedAndAvalible(data.useGroupTaxes);
        return of(data)
      }
    }));

  }

  assignSelectedAndAvalible(selectedGroups: UseGroupTaxAssigned[]) {
    const allGroups = this.useGroupService.getDefaultGroups();
    if (selectedGroups.length > 0) {
      const groups = selectedGroups
      //for each of these, we can remove matching item from the avalble list.  //avalible
      //Also we assign the in useGroupTaxes to the assigned list. //selected
      this.selectedItems = []
      groups.forEach(data => {
        this.selectedItems.push({groupID: 0,value: data.useGroup.id.toString(), text: data.useGroup.name})
      })
      this.removeSelectedFromAvailable(allGroups, groups)
      return
    }
    if (selectedGroups.length == 0) { }
    this.removeSelectedFromAvailable(allGroups, undefined)
  }

  removeSelectedFromAvailable( xallGroups: UseGroups[], xallAssignedGroups: UseGroupTaxAssigned[]): IListBoxItem[]   {
    let allGroups           = xallGroups.map( item =>          ({ groupID: 0,value: item.id.toString(), text: item.name }));
    if (xallAssignedGroups  != undefined) {
      let allAssignedGroups   = xallAssignedGroups.map( item =>  ({ groupID: 0,value: item.useGroupID.toString(), text: item.useGroup.name }));
      allAssignedGroups.forEach(item => {
        const value = allGroups.find( x => x.text.toLowerCase() === item.text.toLowerCase() )
        if (value) {
          allGroups = allGroups.filter(item => item !== value)
        }
      })
      if (allAssignedGroups != undefined) {
        allGroups =  allGroups.filter(item => !allAssignedGroups.includes(item));
      }
    }
    this.refreshUnselected(allGroups)
    return allGroups;
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
    const taxID = this.taxID;
    if (taxID) {
      let useGroups = {} as UseGroupTaxAssignedList[]
      const selected = this.selectedItems
      if (selected) {
        // selected.forEach( item => { useGroups.push( { id:0, taxID: taxID, useGroupID: parseInt(item.value)  }) })
        useGroups = selected.map(item => ({ id: 0, useGroupID: parseInt(item.value), taxID: taxID,  }));
        //push the list even if it's undefined. This way the list will be deleted if no items are assigned to it.
        const groups$ = this.useGroupTaxService.saveList(site, taxID, useGroups)
        this.saving$ = groups$.pipe(switchMap(data => {
            this.matSnack.open(`${data}`, 'Result', {duration: 2000})
            return of(data)
          }
        ))
      }
    }
  }

  convertToIlistBoxItem(listSource: any[]): IListBoxItem[] {
    var result = listSource.map(item => ({ groupID: 0,value: item.id.toString(), text: item.name }));
    return result
  }

  setItemType(event) {
    this.taxRate = event;
    this.taxID = this.taxRate.id;
    this.selectedItems =[]
    this.refreshTaxAssignment(this.taxRate.id)
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


