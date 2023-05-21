import { Component, OnInit, Input } from '@angular/core';

import { MenuService } from 'src/app/_services';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-species-list',
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
