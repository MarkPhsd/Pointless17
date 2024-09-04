import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { IServiceType } from 'src/app/_interfaces';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';

// https://www.freecodecamp.org/news/everything-you-need-to-know-about-ng-template-ng-content-ng-container-and-ngtemplateoutlet-4b7b51223691/

@Component({
  selector: 'app-order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss']
})
export class OrderCardComponent implements OnInit {
  @Input() disableEdit: boolean;
  @Input() order : IPOSOrder;
  serviceColor: string;
  serviceType$ : Observable<IServiceType>;
  phoneDevice: boolean;
  smallDevice : boolean;
  minutesOpen: number;
  orderNameLength: number = 10;

  dateFormat = 'shortDate'
  timeFormat = 'shortTime'
  tableFont = 'font-dark-green font-1-4em font-weight-500';

  @Input() androidApp: boolean;
  matCardClass : string;

  constructor(private serviceTypeService: ServiceTypeService,
              private uiSettingService: UISettingsService,) {
    this.updateItemsPerPage();
  }

  @HostListener("window:resize", [])
   updateItemsPerPage() {
     this.smallDevice = false
     if (window.innerWidth < 811) {
       this.smallDevice = true
     }
     if (window.innerWidth < 599) {
      this.orderNameLength = 12
      this.phoneDevice = true
      this.tableFont = `${this.tableFont} table-font` 
     }
  
   }

  ngOnInit() {
    if (this.order) {
      if(!this.order.total) {
        this.order.total = 0
      }
      if(!this.order.itemCount) {
        this.order.itemCount = 0
      }
      this.minutesOpen = this.getMinutesOpen(this.order)

      if (this.order.serviceTypeID) {
        const id = this.order.serviceTypeID;
        if (this.serviceTypeService.list) {
          const item = this.serviceTypeService.list.filter(data => {return data.id == id})
          if (item) {
            if (item[0] && item[0].serviceColor) {
              this.serviceColor = `background-color:${item[0].serviceColor};`
            }
          }
        }
      }
    }

    this.initTheme();
    this.initAndroidClass()
  }

  initAndroidClass() {
    if (this.androidApp) {
      this.matCardClass = 'mat-card-grid mat-elevation-z0'
    }
  }


  initTheme() {
    // console.log('theme', this.uiSettingService.theme)
    if (this.uiSettingService.theme === 'dark') {
      this.tableFont = 'font-light-green font-1-4em font-weight-500';
    }
  }

  getMinutesOpen(order) : number {
    if (this.order.orderDate) {
      if (this.order.completionDate) {
        return this.getMinutesBetweenTimes(this.order.orderDate, this.order.completionDate)
      }
      const dateTime = new Date()
      return this.getMinutesBetweenTimes(this.order.orderDate, dateTime.toString())
    }
    return 0
  }

  getMinutesBetweenTimes(timeOne, timeTwo) : number {
    if (!timeOne || !timeTwo) { return 0}
    const startTime = new Date(timeOne)
    const endTime = new Date(timeTwo)
    const diff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor((diff/1000)/60);
    if (isNaN(minutes)) { return 0}
    return minutes
  }

  openOrder() {
    if (this.order) {
      //open cart
      //slide card panel from right
      // this.order.serviceType
    }
  }

  get clientNameOfOrder() {
    if (this.order) {
      return this.order?.customerName
    }
  }

  getOrderID(order: IPOSOrder) {
    if (!order.history) {
      return order.id;
    }
    if (order.history) {
      return order.orderID_Temp;
    }
  }

}
