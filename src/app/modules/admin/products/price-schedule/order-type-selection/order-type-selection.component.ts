import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IServiceType } from 'src/app/_interfaces';
import { IPriceSchedule, OrderType,ItemType } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { IItemBasic } from 'src/app/_services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-type-selection',
  templateUrl: './order-type-selection.component.html',
  styleUrls: ['./order-type-selection.component.scss']
})
export class OrderTypeSelectionComponent implements OnInit {

  @Output() outputOrderTypes      :   EventEmitter<any> = new EventEmitter();
  @Input()  inputForm             :   FormGroup;
  @Input()  allOrderTypes         :   boolean;x

  orderTypelist     = [] as IItemBasic[];
  orderTypesForm    : FormGroup;
  serviceTypes      : IServiceType[];
  savedOrderTypes   : any[];
  orderArray        : any[];

  _priceSchedule              : Subscription;
  priceScheduleTracking       : IPriceSchedule;

  initSubscriptions() {
    this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
      this.priceScheduleTracking = data
      this.savedOrderTypes = data.orderTypes
      this.allOrderTypes = data.allOrderTypes
    })
  }

  constructor(private serviceTypeService      : ServiceTypeService,
              private siteService             : SitesService,
              private priceScheduleDataService: PriceScheduleDataService,
  )
  { }

  async ngOnInit() {
    this.initSubscriptions();
    console.log('savedOrderTypes', this.savedOrderTypes)
    if (this.priceScheduleTracking) { this.allOrderTypes = this.priceScheduleTracking.allOrderTypes   }
    await this.initForm()
  }

  async initForm() {
    const site = this.siteService.getAssignedSite();
    const serviceTypes = await this.serviceTypeService.getSaleTypes(site).pipe().toPromise();

    serviceTypes.forEach( data=> {
      this.orderTypelist.push( { name: data.name, id: data.id })
    })
  }

  compareFunction(o1: any, o2: any) {
    // // console.log(o1.orderTypeID, o2.id)
    // console.log('o1', o1)
    // console.log('o2', o2)

    if (o1.name == o2.name) {
      return o2;
    }
  }

  setValues() {
    const list = this.savedOrderTypes;
    const orderList = []  as OrderType[];

    if (list.length == 0) {
      this.priceScheduleTracking.orderTypes = []
      this.priceScheduleDataService.updatePriceSchedule(this.priceScheduleTracking);
      return
    }

    list.forEach( data => {
      if (this.orderTypelist) {
        const  orderArray  = this.orderTypelist.find( info => data.id == info.id)
        if (orderArray) {
            let itemType = {} as ItemType;
            itemType.name = orderArray.name;
            itemType.id   = orderArray.id;
            if(itemType) {
              let orderType          = {} as OrderType;
              orderType.orderTypeID  = data.id;
              orderType.name         = itemType.name

              if(orderType) {
                orderList.push(orderType)
                this.priceScheduleTracking.orderTypes = orderList;
                this.priceScheduleDataService.updatePriceSchedule(this.priceScheduleTracking);
                console.log(orderList)
              }
            }
          }
        }
      }
    )
  }
}
