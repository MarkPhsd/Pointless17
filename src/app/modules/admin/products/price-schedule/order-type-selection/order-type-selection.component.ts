import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IServiceType } from 'src/app/_interfaces';
import { IPriceSchedule, OrderType,ItemType } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleDataService,  } from 'src/app/_services/menu/price-schedule-data.service';
import { IItemBasic } from 'src/app/_services';
import { Subscription } from 'rxjs';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-order-type-selection',
  templateUrl: './order-type-selection.component.html',
  styleUrls: ['./order-type-selection.component.scss']
})
export class OrderTypeSelectionComponent implements OnInit {

  @Output() outputOrderTypes      :   EventEmitter<any> = new EventEmitter();
  @Input()  inputForm             :   FormGroup;

  allOrderTypes     : boolean;
  orderTypelist     = [] as IItemBasic[];
  orderTypesForm    : FormGroup;
  serviceTypes      : IServiceType[];
  savedOrderTypes   : any[];
  orderArray        : any[];

  _priceSchedule    : Subscription;
  priceSchedule     : IPriceSchedule;

  initSubscriptions() {
    this._priceSchedule      = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
      this.priceSchedule     = data
      this.savedOrderTypes   = data.orderTypes
      this.allOrderTypes     = data.allOrderTypes
    })
  }

  constructor(
    private serviceTypeService      : ServiceTypeService,
    private siteService             : SitesService,
    private fbPriceScheduleService  : FbPriceScheduleService,
    private priceScheduleDataService: PriceScheduleDataService,
    private userAuthorizationService: UserAuthorizationService,
  ) { }

  async ngOnInit() {
    this.initSubscriptions();
    await this.initForm()
  }

  ngDestroy() {
    if (this._priceSchedule) {
      this._priceSchedule.unsubscribe();
    }
  }


  async initForm() {
    const site = this.siteService.getAssignedSite();

    if (this.userAuthorizationService.isManagement) { 
      const serviceTypes$  = this.serviceTypeService.getAllServiceTypes(site)
      serviceTypes$.subscribe(serviceTypes => {
            serviceTypes.forEach( data => {
              this.orderTypelist.push( { name: data.name, id: data.id })
            }
          )
        }
      )
      return; 
    }

    const serviceTypesSales$  = this.serviceTypeService.getSaleTypes(site)
    serviceTypesSales$.subscribe(serviceTypes => {
      serviceTypes.forEach( data => {
        this.orderTypelist.push( { name: data.name, id: data.id })
      })
    })
  }

  compareFunction(o1: any, o2: any) {
    if (o1.name == o2.name) {
      return o2;
    }
  }

  setValues() {
    const list = this.savedOrderTypes;
    if (list.length == 0) { this.priceSchedule.orderTypes = [] }
    this.addToList(list, this.orderTypelist, this.priceSchedule)
    this.fbPriceScheduleService.addOrderTypes(this.inputForm, this.priceSchedule.orderTypes);
    this.priceScheduleDataService.updatePriceSchedule(this.priceSchedule);
  }

  addToList(list: any[], typeList: IItemBasic[], priceSchedule: IPriceSchedule  ) {
    const orderTypes = [] as OrderType[];
    list.forEach( data => {
        if (typeList) {
          const  array  = typeList.find( info => data.id == info.id)
          if (array) {
              let type           = {} as OrderType;
              type.orderTypeID   = data.id;
              type.name          = array.name;;
              if(type) {
                orderTypes.push(type)
                priceSchedule.orderTypes = orderTypes;
              }
            }
          }
        }
      )
  }

}
