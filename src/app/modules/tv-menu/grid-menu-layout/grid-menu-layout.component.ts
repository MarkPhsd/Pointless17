import { Component, OnInit } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { GridsterLayoutService,IComponent  } from 'src/app/_services/system/gridster-layout.service';

@Component({
  selector: 'app-grid-menu-layout',
  templateUrl: './grid-menu-layout.component.html',
  styleUrls: ['./grid-menu-layout.component.scss']
})
export class GridMenuLayoutComponent implements OnInit {

  get options(): GridsterConfig {
    return this.layoutService.options;
  }
  get layout(): GridsterItem[] {
    return this.layoutService.layout;
  }
  get components(): IComponent[] {
    return this.layoutService.components;
  }

  constructor(
    public layoutService: GridsterLayoutService
  ) { }

  ngOnInit(): void {
    const i = 0;
  }

}
