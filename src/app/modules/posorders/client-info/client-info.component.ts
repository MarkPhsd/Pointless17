import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IClientTable } from 'src/app/_interfaces';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-client-info',
  templateUrl: './client-info.component.html',
  styleUrls: ['./client-info.component.scss']
})
export class ClientInfoComponent implements OnInit {

  @Input() clientID: number;
  client$: Observable<IClientTable>;

  constructor(
    private siteService: SitesService,
    private clientService: ClientTableService) { }

  ngOnInit(): void {
    if (this.clientID) {
      const site = this.siteService.getAssignedSite()
      this.client$ = this.clientService.getClient(site, this.clientID)
    }
  }

}
