import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Observable  } from 'rxjs';
import {  TaxRate }  from 'src/app/_interfaces';
import { TaxesService } from 'src/app/_services/menu/taxes.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-tax-rate-list',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './tax-rate-list.component.html',
  styleUrls: ['./tax-rate-list.component.scss']
})
export class TaxRateListComponent implements OnInit {

  @Input()  formControl:    string;
  @Input()  inputForm:      UntypedFormGroup;
  items$:                   Observable<TaxRate[]>;
  items:  TaxRate[]
  constructor(private flatRateService: TaxesService,
              private sitesService: SitesService) { }

  ngOnInit(): void {

    const site  =        this.sitesService.getAssignedSite();
    this.items$  =        this.flatRateService.getTaxRates(site);

    this.items$.subscribe(data => {
      this.items = data
    })

  }

  getItem(event) {
    console.log(event.value)
  }

}
