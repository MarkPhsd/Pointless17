import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { UntypedFormGroup } from '@angular/forms';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { clientType } from 'src/app/_interfaces';
import { ClientType, IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { IItemBasic } from 'src/app/_services';
import { Subscription } from 'rxjs';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';

@Component({
  selector: 'app-client-type-selection',
  templateUrl: './client-type-selection.component.html',
  styleUrls: ['./client-type-selection.component.scss']
})
export class ClientTypeSelectionComponent implements OnInit {

  @Output() outputClientTypes    :      EventEmitter<any> = new EventEmitter();
  @Input()  inputForm            :      UntypedFormGroup;

  allEligible        : boolean;
  clientTypeList     = [] as IItemBasic[];
  orderTypesForm     : UntypedFormGroup;
  clientTypes        : clientType[];
  savedClientTypes   : any[];
  clientArray        : any[];

  _priceSchedule     : Subscription;
  priceSchedule      : IPriceSchedule;

  initSubscriptions() {
    this._priceSchedule     = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
      this.priceSchedule    = data
      this.savedClientTypes = this.priceSchedule.clientTypes;
      this.allEligible      = data.allEligible;
    })
  }

  constructor(
            private clientTypeService: ClientTypeService,
            private siteService:        SitesService,
            private fbPriceScheduleService: FbPriceScheduleService,
            private priceScheduleDataService: PriceScheduleDataService,
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
    const clientTypes$ = this.clientTypeService.getClientTypes(site)
    clientTypes$.subscribe(clienTypes => {
      clienTypes.forEach( data=> {
        this.clientTypeList.push( { name: data.name, id: data.id })
      })
    })
  }

  compareFunction(o1: any, o2: any) {
    if (o1.name == o2.name) {
      return o2;
    }
  }

  setValues() {
    const list = this.savedClientTypes;
    if (list.length == 0) { this.priceSchedule.clientTypes = [] }
    this.addToList(list, this.clientTypeList, this.priceSchedule)
    this.fbPriceScheduleService.addClientTypes(this.inputForm, this.priceSchedule.clientTypes);
    this.priceScheduleDataService.updatePriceSchedule(this.priceSchedule);
  }

  addToList(list: any[], typeList: IItemBasic[], priceSchedule: IPriceSchedule  ) {
    const clientList = [] as ClientType[];
    list.forEach( data => {
        if (typeList) {
          const  array  = typeList.find( info => data.id == info.id)
          if (array) {
            let type           = {} as ClientType;
            type.clientTypeID  = data.id;
            type.name          = array.name;
            if(type) {
              clientList.push(type)
              priceSchedule.clientTypes = clientList;
            }
          }
        }
      }
    )
  }

}
