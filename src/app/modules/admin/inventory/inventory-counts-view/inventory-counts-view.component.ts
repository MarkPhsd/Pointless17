import { Component, OnInit, Input, Output, SimpleChanges, OnChanges,OnDestroy, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { AvalibleInventoryResults, IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { InventoryEditButtonService } from 'src/app/_services/inventory/inventory-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'inventory-counts-view',
  templateUrl: './inventory-counts-view.component.html',
  styleUrls: ['./inventory-counts-view.component.scss']
})
export class InventoryCountsViewComponent implements OnInit, OnDestroy {

  @Input() productID: number;
  @Input() active   = true;
  @Input() showAddButton: boolean;
  @Input() showList = true;

  @Output() outPutAddItem :   EventEmitter<IInventoryAssignment> = new EventEmitter();

  results$ : Observable<AvalibleInventoryResults>;
  results : AvalibleInventoryResults;

  isStaff: boolean;
  isAdmin: boolean

  private _order : Subscription;
  private order  : IPOSOrder;

  initSubscriptions(){
     this._order = this.orderService.currentOrder$.subscribe(data =>  {
      if (data) {
        this.order = data;
        this.refreshValues();
        console.log('order updated')
      }
    })
  }

  constructor(private InventoryAssignmentService: InventoryAssignmentService,
              private userAuthService           : UserAuthorizationService,
              private inventoryEditButon        : InventoryEditButtonService,
              private orderService              :  OrdersService,
              private siteService               : SitesService) { }

  ngOnInit() {
    this.refreshValues();
    this.initAuth();
    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._order) {
      this._order.unsubscribe()
    }
  }
  refreshValues() {
    const site = this.siteService.getAssignedSite();
    if (this.productID && this.active) {
      this.results$ = this.InventoryAssignmentService.getAvalibleInventory(site,this.productID, this.active)
      this.results$.subscribe(data => {
        this.results = data;
      })
    }
  }


  editInventoryItem(item) {
    if (this.isAdmin) {
      const invItem  = {id: item.id, productID: this.productID} as IInventoryAssignment;
      this.inventoryEditButon.openInventoryDialog(invItem)
    }
  }

  initAuth() {
    this.isStaff = this.userAuthService.isCurrentUserStaff()
    this.isAdmin = this.userAuthService.isUserAuthorized('admin')
  }

  addItem(){

    if (this.results && this.results.results) {
      const item = this.results.results[this.results.results.length -1]
      this.outPutAddItem.emit(item)

      return
    }
  }

}
