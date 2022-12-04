import { Component, OnInit,Input, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-order-total',
  templateUrl: './order-total.component.html',
  styleUrls: ['./order-total.component.scss']
})
export class OrderTotalComponent implements OnInit {
  smallDevice = false;
  cost: number;

  @Input() order: IPOSOrder
  @Input() mainPanel = false;
  @Input() disableActions: boolean;
  @Input() refreshTime = 1;

  _uiSettings : Subscription;
  uiSettings  : UIHomePageSettings;
  transactionDataClass ="transaction-data"

  @Input()  purchaseOrderEnabled: boolean;

  // initPurchaseOrderOption(id: number) {
  //   if (!id) { return }
  //   if (this.userAuthorization.isManagement) { 
  //     const site = this.siteService.getAssignedSite()
  //     this.serviceType$ = this.serviceTypeService.getType (site,id).pipe(
  //       switchMap(data => { 
  //         this.purchasOrderEnabled = false
  //         if ( data.filterType  && data.filterType != 0 ) {
  //           this.purchasOrderEnabled = true
  //         }
  //         return of(null)
  //       })
  //     )
  //   }
  // }


  homePageSubscriber(){
    try {
      this._uiSettings = this.uiSettingsService.homePageSetting$.subscribe ( data => {
        this.uiSettings = data;

        if (!this.mainPanel) {
          this.transactionDataClass ="transaction-data-side-panel"
        }


        if (!data?.wideOrderBar) {
          this.transactionDataClass = 'transaction-data-side-panel-small'
        }
        // if (data) {
        //   if (data.wideOrderBar) {
        //     if (this.smallDevice)  {
        //         this.matorderBar = 'mat-orderBar'
        //     }
        //   }

        //   if (data.wideOrderBar) {
        if (this.smallDevice)  { this.transactionDataClass = 'transaction-data-side-panel-small'   }
        //     if (!this.smallDevice) { this.matorderBar = 'mat-orderBar-wide'  }
        //   }
        // }
      })
    } catch (error) {
      console.log('HomePage Subscriber', error)
    }
  }

  constructor(
      private uiSettingsService       : UISettingsService,
      public  route: ActivatedRoute) {
    const outPut = this.route.snapshot.paramMap.get('mainPanel');
    if (outPut) {
      this.mainPanel = true
    }
  }

  ngOnInit(): void {
    this.updateScreenSize()
    this.homePageSubscriber()
    this.getCost();
  }

  getCost() {

    this.cost = 0
    if (this.order) { 
      if (this.order.posOrderItems && this.order.posOrderItems.length>0) { 
        this.order.posOrderItems.forEach(data => { 
          const itemCost =  (+data.quantity * +data.wholeSale)
          this.cost = itemCost + this.cost
          // console.log(itemCost)
          // console.log('cost', this.cost)
        })
      }
    }
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.smallDevice = false
    if ( window.innerWidth < 850 ) {
      this.smallDevice = true
    }
  }

}

