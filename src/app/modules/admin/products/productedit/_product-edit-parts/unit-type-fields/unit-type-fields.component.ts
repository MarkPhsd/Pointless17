import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { UnitType } from 'src/app/_interfaces/menu/price-categories';
import { SearchModel } from 'src/app/_services/system/paging.service';

@Component({
  selector: 'app-unit-type-fields',
  templateUrl: './unit-type-fields.component.html',
  styleUrls: ['./unit-type-fields.component.scss']
})
export class UnitTypeFieldsComponent implements OnInit {

  @Input() inputForm: FormGroup

  unitTypes$: Observable<UnitType[]>;
  unitTypes: UnitType[];

  constructor(
    private unitTypeService: UnitTypesService,
    private siteService:     SitesService) { }

  ngOnInit(): void {

    const site   = this.siteService.getAssignedSite();
    let search = {} as SearchModel
    search.pageSize = 100;
    search.pageNumber = 1;

    const search$ = this.unitTypeService.getList(site, search)
    search$.subscribe( data =>{

      this.unitTypes = data.results;
    })
  }

}
