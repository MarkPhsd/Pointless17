import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { clientType } from 'src/app/_interfaces';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Pipe, PipeTransform } from '@angular/core';

@Component({
  selector: 'app-client-types-lookup',
  templateUrl: './client-types-lookup.component.html',
  styleUrls: ['./client-types-lookup.component.scss']
})
export class ClientTypesLookupComponent {

  @Input() clientTypeID: number;
  @Input() clientTypes$: Observable<clientType[]>;
  @Input() inputForm:    FormGroup;

  filter : any;
  constructor(   private siteService: SitesService,
                 private clientTypeService: ClientTypeService,
                 private userAuthorization: UserAuthorizationService) {

    const site = this.siteService.getAssignedSite();
    this.clientTypes$ = this.clientTypeService.getClientTypes(site);

    const user =  this.userAuthorization.currentUser()

    if (user && user.roles) {
      if (user.roles === 'employee') {
        this.filter = {AllowStaffUse: true}
      }

    }
  }

}
