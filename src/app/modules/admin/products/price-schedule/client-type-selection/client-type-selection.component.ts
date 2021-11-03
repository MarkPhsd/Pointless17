import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { FormGroup } from '@angular/forms';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { clientType } from 'src/app/_interfaces';
import { ClientType, IPriceSchedule, ItemType } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { IItemBasic } from 'src/app/_services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-client-type-selection',
  templateUrl: './client-type-selection.component.html',
  styleUrls: ['./client-type-selection.component.scss']
})
export class ClientTypeSelectionComponent implements OnInit {

  @Output() outputClientTypes    :      EventEmitter<any> = new EventEmitter();
  @Input()  inputForm            :      FormGroup;
  @Input()  allEligible          :      boolean;

  clientTypeList     = [] as IItemBasic[];
  orderTypesForm     : FormGroup;
  clientTypes        : clientType[];
  savedClientTypes   : any[];
  clientArray        : any[];

  _priceSchedule              : Subscription;
  priceScheduleTracking       : IPriceSchedule;

  initSubscriptions() {
    this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
      this.priceScheduleTracking = data
      this.savedClientTypes = data.clientTypes
      this.allEligible = data.allEligible
    })
  }

  constructor(
            private clientTypeService: ClientTypeService,
            private siteService:        SitesService,
            private priceScheduleDataService: PriceScheduleDataService,
    ) { }

  async ngOnInit() {
    this.initSubscriptions();
    if (this.priceScheduleTracking) { this.allEligible = this.priceScheduleTracking.allEligible   }
    await this.initForm()
  }

  async initForm() {
    const site = this.siteService.getAssignedSite();
    const clientTypes      = await this.clientTypeService.getClientTypes(site).pipe().toPromise();

    clientTypes.forEach( data=> {
      this.clientTypeList.push( { name: data.name, id: data.id })
    })

  }

  compareFunction(o1: any, o2: any) {
    if (o1.name == o2.name) {
      return o2;
    }
  }

  setValues() {

    const list = this.savedClientTypes;
    const clientList = []  as ClientType[];

    if (list.length == 0) {
      this.priceScheduleTracking.clientTypes = []
      this.priceScheduleDataService.updatePriceSchedule(this.priceScheduleTracking);
      return
    }

    list.forEach( data => {
        if (this.clientTypeList) {
          const  clientArray  = this.clientTypeList.find( info => data.id == info.id)
          if (clientArray) {
            let itemType = {} as ItemType;
            itemType.name = clientArray.name;
            itemType.id   = clientArray.id;
            if(itemType) {
              let clientType           = {} as ClientType;
              clientType.clientTypeID  = data.id;
              clientType.name          = itemType.name;
              // clientType.type = itemType;
              if(clientType) {
                clientList.push(clientType)
                this.priceScheduleTracking.clientTypes = clientList;
                this.priceScheduleDataService.updatePriceSchedule(this.priceScheduleTracking);
                console.log(clientList)
              }
            }
          }
        }
      }
    )

  }

}
