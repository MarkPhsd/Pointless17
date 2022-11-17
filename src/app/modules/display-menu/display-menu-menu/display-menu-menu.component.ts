import { Component, HostListener, OnInit } from '@angular/core';
import { DisplayMenuService } from 'src/app/_services/menu/display-menu.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'display-menu-menu',
  templateUrl: './display-menu-menu.component.html',
  styleUrls: ['./display-menu-menu.component.scss']
})
export class DisplayMenuMenuComponent implements OnInit {

  id: number;
  phoneSize: boolean;

  menu$: Observable<any>;
  constructor(private siteService: SitesService,
              private router: Router,
              private displayMenu: DisplayMenuService) { }

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite()
    this.menu$ = this.displayMenu.getMenus(site);
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
