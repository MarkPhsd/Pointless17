import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription, } from 'rxjs';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
// import { ClientType } from 'src/app/_interfaces';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { IItemBasic } from 'src/app/_services';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
import { DashboardModel } from '../grid-models';

export interface ClientType {
  id:              number;
  clientTypeID:    number;
  name:            string;
}

@Component({
  selector: 'dashboard-client-type-selection',
  templateUrl: './client-type-selection.component.html',
  styleUrls: ['./client-type-selection.component.scss']
})
export class ClientTypeSelectionComponent implements OnInit, OnDestroy {

  @Output() outputClientTypesJSON:      EventEmitter<any> = new EventEmitter();
  @Output() outputClientTypes    :      EventEmitter<any> = new EventEmitter();

  @Input()  inputForm            :      FormGroup;
  @Input() dashboardModel:  DashboardModel;
  allEligible        : boolean;
  clientTypeList     = [] as IItemBasic[];
  orderTypesForm     : FormGroup;
  clientTypes        : ClientType[];
  savedClientTypes   : any[];
  clientArray        : any[];

  _dashboardModel: Subscription;

  initSubscriptions() {
    this._dashboardModel = this.layoutService.dashboardModel$.subscribe(data =>
      {
        this.dashboardModel = data;
      }
    )
  }

  constructor(
            private clientTypeService:  ClientTypeService,
            private siteService:        SitesService,
            private layoutService:      GridsterLayoutService,
            private fbPriceScheduleService: FbPriceScheduleService,
  ) { }

  ngOnInit() {
    if (this.dashboardModel && this.dashboardModel.widgetRolesJSON) { 
      this.savedClientTypes = JSON.parse(this.dashboardModel.widgetRolesJSON);
      if (this.savedClientTypes ) { 
        this.initForm()
      }
    }
  }

  ngOnDestroy() {
    if (this._dashboardModel) {
      this._dashboardModel.unsubscribe();
    }
  }

  async initForm() {
    const site = this.siteService.getAssignedSite();
    const clientTypes$ = this.clientTypeService.getClientTypes(site)
    clientTypes$.subscribe(clientTypes => {
      clientTypes.forEach( data=> {
        this.clientTypeList.push( { name: data.name, id: data.id })
      })
      if ( this.dashboardModel) { 
        this.setValues()
      }    
    })
  }

  compareFunction(o1: any, o2: any) {
    if (o1.name == o2.name) {
      return o2;
    }
  }

  setValues() {
    console.log('setValues', this.savedClientTypes)
    if ( !this.savedClientTypes ) {return }
    const list = this.savedClientTypes;
    if (list.length == 0) { this.dashboardModel.widgetRoles  = [] }
    this.addToList(list, this.clientTypeList, this.dashboardModel)
  }

  addToList(list: any[], typeList: IItemBasic[], dashboardModel: DashboardModel  ) {
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
              dashboardModel.widgetRoles = clientList;
              dashboardModel.widgetRolesJSON = JSON.stringify(clientList)
              this.outputClientTypes.emit(clientList)
              this.outputClientTypesJSON.emit(dashboardModel.widgetRolesJSON)
            }
          }
        }
      }
    )
  }

}
