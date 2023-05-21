import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs'
import { FlatRateService } from 'src/app/_services/map-routing/flat-rate.service';
import { FlatRateTax } from 'src/app/_services/menu/item-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-flat-tax-rate-list',
  templateUrl: './flat-tax-rate-list.component.html',
  styleUrls: ['./flat-tax-rate-list.component.scss']
})
export class FlatTaxRateListComponent {

  @Input()  inputForm:      UntypedFormGroup;
  items$:                   Observable<FlatRateTax[]>;
  items:    FlatRateTax[]

  constructor(private flatRateService: FlatRateService,
              private sitesService: SitesService) {

    const site      =  this.sitesService.getAssignedSite();
    this.items$     =  this.flatRateService.getList(site);
    this.items$.subscribe(data => {
      this.items = data
    })

  }



  getItem(event) {
    console.log(event.value)
  }

}
