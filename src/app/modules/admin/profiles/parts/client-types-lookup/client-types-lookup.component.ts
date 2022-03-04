import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { clientType } from 'src/app/_interfaces';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-client-types-lookup',
  templateUrl: './client-types-lookup.component.html',
  styleUrls: ['./client-types-lookup.component.scss']
})
export class ClientTypesLookupComponent {

  @Input() clientTypeID: number;
  @Input() clientTypes$: Observable<clientType[]>;
  @Input() inputForm:    FormGroup;

  myFilter   : any;
  user       : any;
  clientTypes: clientType[];
  constructor(   private siteService: SitesService,
                 private clientTypeService: ClientTypeService,
                 private userAuthorization: UserAuthorizationService) {

    const user =  this.userAuthorization.currentUser()
    const site = this.siteService.getAssignedSite();
    this.clientTypes$ = this.clientTypeService.getClientTypes(site);
    this.clientTypes$.subscribe(data => {
      if (data) {
        if (user?.roles === 'admin' || user?.roles === 'manager') {
          this.clientTypes = data
          return
        }
        this.clientTypes = data.filter(  data => data.allowStaffUse ==  true)
      }
    })

  }

}
