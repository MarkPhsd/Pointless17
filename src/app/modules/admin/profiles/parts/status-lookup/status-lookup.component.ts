import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { clientType } from 'src/app/_interfaces';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { StatusTypeService } from 'src/app/_services/people/status-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-status-lookup',
  templateUrl: './status-lookup.component.html',
  styleUrls: ['./status-lookup.component.scss']
})
export class StatusLookupComponent {

  @Input() statusID: number;
  @Input() statuses$: Observable<any>;
  @Input() inputForm:    FormGroup;

  constructor(   private siteService: SitesService,
                 private statusTypeService: StatusTypeService,) {

  const site = this.siteService.getAssignedSite();
  this.statuses$ = this.statusTypeService.getStatuses(site);
}

}
