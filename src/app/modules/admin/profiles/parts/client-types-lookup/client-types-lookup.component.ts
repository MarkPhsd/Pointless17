import { Component, forwardRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of , switchMap} from 'rxjs';
import { clientType } from 'src/app/_interfaces';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import {NO_ERRORS_SCHEMA} from "@angular/core";

@Component({
  selector: 'app-client-types-lookup',
  templateUrl: './client-types-lookup.component.html',
  styleUrls: ['./client-types-lookup.component.scss'],
  providers: [
    {
      provide: [NG_VALUE_ACCESSOR, NO_ERRORS_SCHEMA],
      useExisting: ClientTypesLookupComponent,
      multi: true,
    },
  ],
})

export class ClientTypesLookupComponent implements OnInit {

  @ViewChild('defaultClientTypeID') defaultClientTypeMat: TemplateRef<any>;
  @ViewChild('clientTypeView')        clientTypeMat: TemplateRef<any>;

  @Input() style           : string;
  @Input() clientTypeID    : number;
  @Input() clientTypes$    : Observable<clientType[]>;
  @Input() inputForm       : FormGroup;
  @Input() formControlName = 'clientTypeID';

  myFilter   : any;
  user       : any;

  clientTypes: clientType[];

  constructor(   private siteService: SitesService,
                 private clientTypeService: ClientTypeService,
                 private userAuthorization: UserAuthorizationService) {
  }

  ngOnInit(): void {

    const site        = this.siteService.getAssignedSite();
    this.clientTypes$ = this.clientTypeService.getClientTypes(site);
    this.initClientTypes()

  }

  get matSelectOption() {
    if (this.formControlName === 'clientTypeID') {
      return this.clientTypeMat
    }
    if (this.formControlName === 'defaultClientTypeID') {
      return this.defaultClientTypeMat
    }
    return this.clientTypeMat
  }

  initClientTypes() {
    const user =  this.userAuthorization.currentUser()
    const site = this.siteService.getAssignedSite();
    this.clientTypes$ =  this.clientTypeService.getClientTypes(site).pipe(
      switchMap(data => {
        if (data) {
          if (user?.roles === 'admin' || user?.roles === 'manager') {
            this.clientTypes = data
            return of(data)
          }
          this.clientTypes = data.filter(  data => data.allowStaffUse ==  true)
          return of(this.clientTypes)
        }
        return null
      }))
    }

}
