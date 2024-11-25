import { Component, OnInit, Input } from '@angular/core';

import { MenuService } from 'src/app/_services';
import { UntypedFormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-species-list',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.scss']
})

export class SpeciesListComponent  {

  @Input()  inputForm:   UntypedFormGroup;

  speciesTypes:     any[];
  speciesType:      string;

  constructor(private menuService: MenuService,) {
    this.speciesTypes = this.menuService.getSpeciesType();
   }

}
