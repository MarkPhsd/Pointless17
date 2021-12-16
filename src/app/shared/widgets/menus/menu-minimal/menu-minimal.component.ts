import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AccordionMenu, accordionConfig, SubMenu, IUser, ISite } from 'src/app/_interfaces/index';
import { EMPTY, Observable, Subscription, } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { transition, animate, style, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AuthenticationService } from 'src/app/_services';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-menu-minimal',
  templateUrl: './menu-minimal.component.html',
  styleUrls: ['./menu-minimal.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({opacity: 0}),
        animate(300, style({opacity: 1}))
      ]),
      transition('* => void', [
        animate(300, style({opacity: 0}))
      ])
    ])
  ]
})

export class MenuMinimalComponent implements OnInit, OnDestroy {

  accordionMenu$:    Observable<AccordionMenu[]>;
  @Input()           options;
  @Input() menus:    AccordionMenu[];
  submenu:           SubMenu[];
  config:            accordionConfig;
  displayCategories: boolean;
  index:             number;
  result:            boolean;

  user              : IUser;
  _user             : Subscription;
  site              : ISite;
  initSubscription() {
    this._user = this.authenticationService.user$.pipe(
      switchMap(
        user => {
            this.user = user
            if (!user) {
              this.menus = [] as AccordionMenu[];
              return EMPTY
            }
            return  this.menusService.getMainMenu(this.site, user)
          }
        )
      ).subscribe( data => {
        this.menus = [] as AccordionMenu[];
        if (!data) {
           console.log('no menu found')
           return
        }
        this.config = this.mergeConfig(this.options);

        if (data)
          data.filter( item => {
            if (item.active) {this.menus.push(item) } //= data
          })
        }, err => {
          console.log('err no menu found', err)
          this.menus = [] as AccordionMenu[];
      }
    )
  }

  constructor ( private menusService            : MenusService,
                private router                  : Router,
                private siteService             : SitesService,
                private authenticationService   : AuthenticationService,
              ) {
    this.site  =  this.siteService.getAssignedSite();
  }

  async ngOnInit() {
    const site  = this.siteService.getAssignedSite();
    this.initSubscription()
    this.menusService.mainMenuExists(site).subscribe( data => {
      if (!data.result) {
        this.initMenu();
      }
    })
  }

  initMenu() {
    const site  = this.siteService.getAssignedSite();
    const menuCheck$ = this.menusService.mainMenuExists(site);
    menuCheck$.pipe(
      switchMap( data => {
        if (!data || !data.result) {
          const user = this.authenticationService.userValue

           if (user) {
            return  this.menusService.createMainMenu(user , site)
          }
          return EMPTY;
        }
      })
    ).subscribe(data => {
      this.initSubscription()
    })
  }

  ngOnDestroy() {
    if (this._user) { this._user.unsubscribe() }
  }

  mergeConfig(options: accordionConfig) {
    const config = {
      multi: true
    };
    return { ...config, ...options };
  }

  resetMenu() {
    this.displayCategories = false;
  }

  routerNavigation(url: string) {
    this.router.navigate([url]);
  }

  toggle(menu: AccordionMenu, index: number) {
    try {
      this.displayCategories = true
      this.index = index;
      if (!this.config.multi) {
        this.menus.filter(
          (menu, i) => i !== index && menu.active
        ).forEach(menu => menu.active = !menu.active);
      }
      this.menus[index].active = !this.menus[index].active;
      this.submenu  = this.menus[index].submenus
      if (menu.routerLink) {
        this.routerNavigation(menu.routerLink)
      }
    } catch (error) {
      console.log(error)
    }
  }

}
