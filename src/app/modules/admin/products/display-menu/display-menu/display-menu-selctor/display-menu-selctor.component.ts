import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { moveItemInArray, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { IListBoxItem, IItemsMovedEvent, IListBoxItemB } from 'src/app/_interfaces/dual-lists';
import { Observable, Subject ,fromEvent, of ,switchMap, map} from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IProductCategory, ISite, TaxRate } from 'src/app/_interfaces';
import { UseGroupsService, Taxes, UseGroupTax, UseGroups } from 'src/app/_services/menu/use-groups.service';
import { UseGroupTaxesService } from 'src/app/_services/menu/use-group-taxes.service';
import { TaxesService, UseGroupTaxAssigned, UseGroupTaxAssignedList } from 'src/app/_services/menu/taxes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PriceCategories } from 'src/app/_interfaces/menu/price-categories';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';

export interface ISelectedMenu {
  name: string;
  id: number
}

@Component({
  selector: 'display-menu-selctor',
  templateUrl: './display-menu-selctor.component.html',
  styleUrls: ['./display-menu-selctor.component.scss']
})
export class AdminDisplayMenuSelctorComponent implements OnInit {

  @Input()  listOfMenus: any;
  @Output() outPutList = new EventEmitter();
  // field to use for value of option
  @Input() valueField    = 'id';
  // field to use for displaying option text
  @Input() textField     = 'name';
  // text displayed over the available items list box
  @Input() availableText = 'Available items';
  // text displayed over the selected items list box
  @Input() selectedText  = 'Selected items';
  // set placeholder text in available items list box
  @Input() availableFilterPlaceholder = 'Filter...';
  // set placeholder text in selected items list box
  @Input() selectedFilterPlaceholder = 'Filter...';
  // event called when items are moved between boxes, returns state of both boxes and item moved
  @Output() itemsMoved: EventEmitter<IItemsMovedEvent> = new EventEmitter<IItemsMovedEvent>();

  // array of items to display in left box
  @Input() set availables(items: Array<{}>) {
    this.availableItems = [...(items || []).map((item: {}, index: number) => ({
      id: item[this.valueField].toString(),
      name: item[this.textField],
    }))];
  }
  // array of items to display in right box
  @Input() set selects(items: Array<{}>) {
    this.selectedItems = [...(items || []).map((item: {}, index: number) => ({
      id:  item[this.valueField].toString(),
      name: item[this.textField],
    }))];
  }

  selectedMenu    : ISelectedMenu;
  ISelectedMenus  = [] as ISelectedMenu[];
  //useGroups lists on the left.
  priceSchedules$  : Observable<IPriceSchedule[]>;
  priceSchedules   : IPriceSchedule[];
  assignedStatic   : any;
  allAssigned      : any;

  availableItems   : Array<IListBoxItemB>  = [];
  selectedItems    : Array<IListBoxItemB> = [];
  listBoxForm      : FormGroup;

  constructor(
    private siteService         : SitesService,
    private priceScheduleService: PriceScheduleService,
    public  fb                  : FormBuilder
    ) {

  }

  ngOnInit(): void {
    this.initForm();
    if (this.initSelectedList()) {
      this.initListMenuList();
    }
  }

  initForm() {
    this.listBoxForm = this.fb.group({
      availableSearchInput: [''],
      selectedSearchInput: [''],
    });
  }

  initListMenuList(){
    const site = this.siteService.getAssignedSite()
    this.priceSchedules$ = this.priceScheduleService.getList(site).pipe(
      switchMap(data => {
        this.availableItems = []
        data.forEach(item =>
          {
            this.availableItems.push({name: item.name, id: item.id.toString()})

            // this.availableItems = this.availableItems.filter( function( el ) {
            //   return this.selectedItems.indexOf( el ) < 0;
            // });

            const items = this.availableItems
            const remove = this.selectedItems
            this.availableItems = items.filter(ar => !remove.find(rm => (rm.name === ar.name && ar.id === rm.id) ))
          }
        )

        return of(data)
        }
      )
    )
  }

  initSelectedList() {
    this.selectedItems = []

    if (this.listOfMenus) {
      this.listOfMenus.forEach(item => {
        this.selectedItems.push({name: item.name, id: item.id.toString()})
      })
    }

    return true
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
    this.itemsMoved.emit({
      available: this.availableItems,
      selected: this.selectedItems,
      movedItems: event.container.data.filter((v, i) => i === event.currentIndex),
      from: 'available',
      to  : 'selected',
    });
    this.saveAssignedGroups()
  }

  saveAssignedGroups() {

    const selected = this.selectedItems
    if (selected) {
      const list = selected.map(item => ({ id: item.id, name: item.name,  }));
      this.outPutList.emit(list);
      console.log('list', list)
    }

  }

}
