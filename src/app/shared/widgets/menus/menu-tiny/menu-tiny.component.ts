import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AccordionMenu, accordionConfig, SubMenu, IUser } from 'src/app/_interfaces/index';
import { Observable, Subscription, } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { fadeAnimation } from 'src/app/_animations';

@Component({
  selector: 'app-menu-tiny',
  templateUrl: './menu-tiny.component.html',
  styleUrls: ['./menu-tiny.component.scss'],
  animations: [
    fadeAnimation
  ]
})

export class MenuTinyComponent implements OnInit, OnDestroy {

  accordionMenu$:    Observable<AccordionMenu[]>;
  @Input() options;
  @Input() menus:    AccordionMenu[];
  submenu:           SubMenu[];
  config:            accordionConfig;
  displayCategories: boolean;
  index:             number;
  result:            boolean;
  user              : IUser;
  _user             : Subscription;

  initSubscription() {

    if (this.authenticationService.userValue) {
      this.user = this.authenticationService.userValue;
    }

    this._user = this.authenticationService.user$.subscribe( data => {
      this.user  = data
      // console.log('user updated', data)
      this.getMenu();
    })

  }

  constructor ( private menusService            : MenusService,
                private userAuthorizationService: UserAuthorizationService,
                private router                  : Router,
                private siteService             : SitesService,
                private authenticationService   : AuthenticationService,
              ) {

              }

  async ngOnInit() {
    this.initSubscription();
  }

  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._user) {
      this._user.unsubscribe()
    }
  }

  async refreshMenu() {
    if (this.authenticationService.userValue) {
      this.user = this.authenticationService.userValue
      this.getMenu();
    }
  }

  async getMenu() {
    if (!this.user) {
      console.log('No User Assigned')
      return;
    }
    // console.log('getmenu', this.user)
    const site  =  this.siteService.getAssignedSite();
    this.config = this.mergeConfig(this.options);
    this.accordionMenu$ =  this.menusService.getMainMenu(site)
    this.accordionMenu$.subscribe(data=>{
      this.menus = [] as AccordionMenu[];
      data.filter( item => {
        if (item.active) {
          this.menus.push(item)  //= data
        }
      })
    }, err => {
      console.log('err', err)
    })
    this.displayCategories = false;
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

  isAuthorized(menu: any): boolean {
    return this.userAuthorizationService.isUserAuthorized(menu.userType)
  }

   getUserInfo() {

    this.user = {} as IUser;

    const user = JSON.parse(localStorage.getItem('user')) as IUser;
    // this.snackBar.open(user.username.toString(), 'Changed', {verticalPosition: 'top', duration: 2000})

    if (!user) {  return null }
    this.user = user;
    this.getName(user);

  }

  getName(user : IUser) {
    let lastName  = user.lastName
    let firstName =  user.firstName
    // if (firstName && lastName) {
    //   this.employeeName = `${user.username}`
    // }
    // this.snackBar.open(`Name ${this.employeeName}`, 'Changed', {verticalPosition: 'top', duration: 2000})
    return
  }




}

