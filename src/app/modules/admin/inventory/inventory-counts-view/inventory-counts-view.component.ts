import { Component, OnInit, Input, Output, SimpleChanges, OnChanges,OnDestroy, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IPOSOrder, IProduct } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { AvalibleInventoryResults, IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { InventoryEditButtonService } from 'src/app/_services/inventory/inventory-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

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

  product: IProduct;

  @Input() set setProductID(productID: number) {
    this.productID = productID
    this.refreshValues()
    }

  @Output() outPutAddItem :   EventEmitter<IInventoryAssignment> = new EventEmitter();
  @Output() outPutSetCount :   EventEmitter<number> = new EventEmitter();

  results$ : Observable<AvalibleInventoryResults>;
  results : AvalibleInventoryResults;

  isStaff: boolean;
  isAdmin: boolean
  refresh : boolean;

  private _order : Subscription;
  private order  : IPOSOrder;

  initSubscriptions(){
     this._order = this.orderMethodsService.currentOrder$.subscribe(data =>  {
      if (data) {
        this.order = data;
        this.refreshValues();
      }
    })
  }

  constructor(private inventoryAssignmentService: InventoryAssignmentService,
              private userAuthService           : UserAuthorizationService,
              private inventoryEditButon        : InventoryEditButtonService,
              private orderService              :  OrdersService,
              private orderMethodsService       : OrderMethodsService,
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
    // console.log('refresh', this.productID)
    const site = this.siteService.getAssignedSite();
    this.refresh = true

    if (this.productID && this.active) {
      this.results$ = this.inventoryAssignmentService.getAvalibleInventory(site, this.productID, this.active)
      this.results$.subscribe(data => {
        if (data) {
          this.results = data;
          this.refresh = false
          this.inventoryAssignmentService.updateAvalibleInventoryResults(this.results)
        }
      })
    }
  }

  setCountToInventory() {
    if (this.results) {
      this.outPutSetCount.emit(this.results.total)
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
    console.log('!results', this.results, this.results.results)
    if (!this.results.results) {
      this.siteService.notify('Not items to sell.', "Alert", 3000);
      return;
    }
    if (this.results && this.results.results) {
      const item = this.results.results[this.results.results.length -1]
      this.outPutAddItem.emit(item)
      return
    }
  }

}
