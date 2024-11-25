import { Component, HostListener, OnInit } from '@angular/core';
import { DisplayMenuService } from 'src/app/_services/menu/display-menu.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'display-menu-menu',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

  templateUrl: './display-menu-menu.component.html',
  styleUrls: ['./display-menu-menu.component.scss']
})
export class DisplayMenuMenuComponent implements OnInit {


  //this is not being used at all right now, it's not in the router
  //it's only in the shared module.

  id: number;
  phoneSize: boolean;
  menu$: Observable<any>;

  constructor(private siteService: SitesService,
              private router: Router,
              private displayMenu: DisplayMenuService) { }

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite()
    this.menu$ = this.displayMenu.getMenus(site)
  }

  setItem(event) {
    this.router.navigate(["/display-menu/", {id: event?.id }]);
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    if (window.innerWidth < 768) {
      return
    }
    if (window.innerWidth < 399) {
      this.phoneSize = false
    }
  }


}
