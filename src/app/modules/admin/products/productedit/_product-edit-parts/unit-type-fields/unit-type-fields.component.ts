import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { UnitType } from 'src/app/_interfaces/menu/price-categories';
import { SearchModel } from 'src/app/_services/system/paging.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-unit-type-fields',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

  templateUrl: './unit-type-fields.component.html',
  styleUrls: ['./unit-type-fields.component.scss']
})
export class UnitTypeFieldsComponent implements OnInit {

  @Input() inputForm: UntypedFormGroup

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
