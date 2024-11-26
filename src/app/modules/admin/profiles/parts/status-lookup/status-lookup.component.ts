import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { StatusTypeService } from 'src/app/_services/people/status-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-status-lookup',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
           FormsModule,ReactiveFormsModule,
         ],
  templateUrl: './status-lookup.component.html',
  styleUrls: ['./status-lookup.component.scss']
})
export class StatusLookupComponent {
  @Input() style    : string;
  @Input() statusID: number;
  @Input() statuses$: Observable<any>;
  @Input() inputForm:    UntypedFormGroup;

  constructor(   private siteService: SitesService,
                 private statusTypeService: StatusTypeService,) {

  const site = this.siteService.getAssignedSite();
  this.statuses$ = this.statusTypeService.getStatuses(site);
}

}
