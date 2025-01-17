import { Component, OnInit, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { moveItemInArray, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { IListBoxItem, IItemsMovedEvent } from 'src/app/_interfaces/dual-lists';
import { concatMap, map, Observable, of, switchMap} from 'rxjs';
import { IItemBasic, IItemBasicB } from 'src/app/_services/menu/menu.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrdersService } from 'src/app/_services';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { group } from 'console';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { PrintGroupReceiptComponent } from './print-group-receipt/print-group-receipt.component';

export interface   ISelectedItems{
  id        : number;
  name      : string;
  groupID   : number;
}

@Component({
  selector: 'app-possplit-items',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    PrintGroupReceiptComponent,
  SharedPipesModule],
  templateUrl: './possplit-items.component.html',
  styleUrls: ['./possplit-items.component.scss']
})
export class POSSplitItemsComponent implements OnInit {

    smallDevice         = false;
    @Output() outPutPaymentAmount = new EventEmitter();
    @Input() order   : IPOSOrder;
    @Input() androidApp: boolean;

    order$: Observable<IPOSOrder>;
    saveAssignedItems$: Observable<any>;
    productTypes$    : Observable<IItemBasicB[]>;
    orderItems       : PosOrderItem[];
    productTypes     : IItemBasic[];
    orderGroupTotal$ : Observable<IPOSOrder>;

    typeID           : number;
    assignedStatic   : any;
    allAssigned      : any;
    itemID           : number;
    currentGroupID   = 1;
    currentGroup     = '1';
    selectedItems$   : Observable<any>
    allitems$        : Observable<any>
    changesOcurred   = false;
    savingChanges    : boolean;
    transferAllowed  : boolean;

    // {id:0,name: 0},
    values  =
      [

        {id:1,name: 1},
        {id:2,name: 2},
        {id:3,name: 3},
        {id:4,name: 4},
        {id:5,name: 5},
        {id:6,name: 6},
        {id:7,name: 7},
        {id:8,name: 8},
        {id:9,name: 9},
    ]

    // array of items to display in left box
    @Input() set availables(items: Array<{}>) {
      this.availableItems = [...(items || []).map((item: {}, index: number) => ({
        value: item[this.valueField].toString(),
        text: item[this.textField],
        groupID: item[this.currentGroupID]
      }))];
    }

    // array of items to display in right box
    @Input() set selects(items: Array<{}>) {
      this.selectedItems = [...(items || []).map((item: {}, index: number) => ({
        value: item[this.valueField].toString(),
        text: item[this.textField],
        groupID: item[this.currentGroupID]
      }))];
    }

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

    availableItems: Array<IListBoxItem> = [];
    selectedItems : Array<IListBoxItem> = [];
    listBoxForm   : UntypedFormGroup;

    filterGroup(item: PosOrderItem, groupValue: number) {
      if (!item.splitGroupID) return false;
      return item.splitGroupID == groupValue;
    }

    subscriber() {
      this.orderMethodsService.currentOrder$.subscribe(data => {
        if (data) {
          this.order = data;
        }
      })
    }

    constructor(
      private siteService: SitesService,
      private orderService: OrdersService,
      public orderMethodsService: OrderMethodsService,
      public printingService: PrintingService,
      private matSnack   : MatSnackBar,
      public fb: UntypedFormBuilder) {
      this.listBoxForm = this.fb.group({
        availableSearchInput: [''],
        selectedSearchInput:  [''],
      });
    }

    @HostListener("window:resize", [])
    updateItemsPerPage() {
      this.smallDevice = false
      if (window.innerWidth < 768) {
        this.smallDevice = true
      }
      if (!this.smallDevice) {
      }
    }

    ngOnInit() {
      this.updateItemsPerPage()
      const site = this.siteService.getAssignedSite()
      this.initGroupList();
      this.applyGroupID(1);
      this.setGroupOrderTotal(site, this.order.id, 1)
      this.refreshOrder();
    }

    initGroupList(): any {
      if (this.order && this.order.posOrderItems) {
        const result = this.order.posOrderItems.filter(data => {
          return data.idRef == data.id;
        })
        return this.removeSelectedFromAvailable(result, 1)
      }
    }

    applyGroupID(event) {
      if (event) {
        let groupID = event?.id;
        if (!groupID) { groupID = 1}
        if (groupID == 0) { groupID = 1}

        this.currentGroupID = groupID
        this.currentGroup   = groupID.toString()
        this.changesOcurred = false;
        this.refreshAssignedItems();
      }
    }

    removeSelectedFromAvailable( orderItems: PosOrderItem[], groupID: number): IListBoxItem[]   {
      let allItems = orderItems.map( item => (
          { value  : item.id.toString(),
            text   : item.productName,
            groupID: item.splitGroupID }
        )
      );

      this.availableItems = allItems.filter( x => {
          if ( x.groupID == 0 || x.groupID == 1 || x.groupID == undefined  || x.groupID == null ) {
            return x;
          }
        }
      )

      const assignedItems = allItems.filter( x => {
        if ( x.groupID != 0 && x.groupID != 1 && x.groupID != undefined && x.groupID != null ) {
          return x;
        }
      })

      // console.log('assignedItems' , assignedItems)
      return assignedItems;
    }

    setAvalibleItems(orderItems: PosOrderItem[]) {

    }

    convertTolistBoxItem(listSource: any[]): IListBoxItem[] {
      return listSource.map(item => (
        { value:   item.id.toString(),
          text:    item.name,
          groupID: item.splitGroupID
        })
      );
    }

    //we are saving the Whole List of assigned or
    //we are saving the added.
    // i feel like it's easier to push the whole list,
    //and keep a reference to the selecteditems, then push the whole list.
    saveAssignedCategories(selected: IListBoxItem[]) {
      // if (selected) {
        // if (selected.length     == 0)  { return   }

        const site           = this.siteService.getAssignedSite();
        const items$         = this.orderService.applyItemsToGroup(site, this.currentGroupID, selected);
        const assignedItems$ = this.orderService.applyItemsToGroup(site, 1, this.availableItems)

        this.saveAssignedItems$ = items$.pipe(
          concatMap(data => {
            return assignedItems$
          })).pipe(
            concatMap(data => {
            if (data) {
              this.setGroupOrderTotal(site, this.order.id, this.currentGroupID)
              this.changesOcurred = false;
              this.savingChanges = false
            }
            return  this.orderService.getOrder(site, this.order.id.toString() , false)
        })).pipe(
          concatMap(data => {
          this.orderMethodsService.updateOrder(data);
          //then update the split groups in the pos-payment. we can trigger this from the order update option?
          // setTimeout(data => {console.log('refresh')}, 500)
          return of(data)
        }));

      // console.log('selected', selected)
    }

    setGroupOrderTotal(site, orderID, groupID) {
      this.orderGroupTotal$ = this.orderService.getPOSOrderGroupTotal(site, orderID, groupID).pipe(
        concatMap(data => {
          return of(data)
        })
      )
    }

    refreshOrder() {
      const site = this.siteService.getAssignedSite()
      this.order$ = this.orderService.getOrder(site, this.order.id.toString() , false).pipe(
        concatMap(data => {
          this.orderMethodsService.updateOrder(data);
          return of(data)
      }))
    }

    submitPaymentAmount() {
      this.orderGroupTotal$.subscribe( data => {
        if (!data) { return }
         this.outPutPaymentAmount.emit({amount: data.total.toFixed(2), groupID: this.currentGroupID})
      })
    }

    makePayment(event) {
      this.outPutPaymentAmount.emit(event)
    }

    refreshAssignedItems() {

      if (!this.order) return;
      if (!this.currentGroupID) { this.currentGroupID = 1 };
      const site = this.siteService.getAssignedSite();

      const selectedItems$  = this.orderService.getSplitItemsList(site, this.order?.id, this.currentGroupID);

      this.orderGroupTotal$ = selectedItems$.pipe(switchMap(data => {
          this.selectedItems = data
          return this.orderService.getOrder(site, this.order.id.toString(), false);
      })).pipe(switchMap(data => {
        {
          this.orderMethodsService.updateOrder(data)
          return this.orderService.getPOSOrderGroupTotal(site, this.order.id, this.currentGroupID);
        }
      })).pipe(switchMap(data => {
        return of(data)
      }));

    }

    refreshUnassignedItems() {
      const site = this.siteService.getAssignedSite()
      this.allitems$ = this.orderService.getSplitItemsList(site, this.order.id, 1).pipe(switchMap(data => {
        this.availableItems = data
        return of(data)
      }))
    }

    assignArrayToItemType(selected: IListBoxItem[]) {
      if (!this.selectedItems) { this.selectedItems = [] };
      selected.forEach( data => {
        this.selectedItems.push(data)
      });
      this.saveAssignedCategories(selected);
    }

    drop(event: CdkDragDrop<IListBoxItem[]>) {
      if (event.previousContainer === event.container) {
        // console.log('moveItemInArray')
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        // console.log('transferArrayItem')
        transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      }

      let groupID = event.currentIndex;
      if (groupID == 0) {
        groupID = 1
      }
      // clear marked available items and emit event
      this.itemsMoved.emit({
        available: this.availableItems,
        selected: this.selectedItems,
        movedItems: event.container.data.filter((v, i) => i === event.currentIndex),
        from: 'available',
        to: 'selected',
      });

      this.availableItems.forEach(data => {  data.groupID = 1; })

      this.selectedItems.forEach(data => {   data.groupID = this.currentGroupID; });
      this.changesOcurred = true;
    }

    dropToList(event: CdkDragDrop<IListBoxItem[]>, index: number) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      }

      // clear marked available items and emit event
      this.itemsMoved.emit({
        available: this.availableItems,
        selected: this.selectedItems,
        movedItems: event.container.data.filter((v, i) => i === event.currentIndex),
        from: 'available',
        to: 'selected',
      });

      this.availableItems.forEach(data => {  data.groupID = 1; })
      this.selectedItems.forEach(data => { data.groupID = this.currentGroupID; });
      this.changesOcurred = true;
    }

    saveChanges() {
      if (!this.order) return;
      const paymentsMade  = this.order.balanceRemaining.toFixed(2 )== this.order.total.toFixed(2);
      if (!paymentsMade) {
        this.matSnack.open(`Unable to save, payments have been applied. Apply payments based on normal procedures.
                            Balance is: ${this.order?.balanceRemaining} and total is ${this.order?.total}`, 'Alert');
        this.changesOcurred = false;
        this.savingChanges = false;
        return;
      }
      this.savingChanges = true
      this.saveAssignedCategories(this.selectedItems);
    }

}


