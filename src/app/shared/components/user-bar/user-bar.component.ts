import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { Subscription, switchMap, Observable, of  } from 'rxjs';
import { AuthenticationService } from 'src/app/_services';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MenusService } from 'src/app/_services/system/menus.service';
import { AccordionMenu, IUser, MenuGroup, SubMenu } from 'src/app/_interfaces';

@Component({
  selector: 'user-bar',
  templateUrl: './user-bar.component.html',
  styleUrls: ['./user-bar.component.scss']
})
export class UserBarComponent implements OnInit {
  customerMenu = 'customer'
  user$ : Observable<IUser>;
  user  : IUser;
  currentMenu   : MenuGroup;
  accordionMenus: AccordionMenu[];
  mailCount  = 0;
  
  constructor(
    private navigationService   : NavigationService,
    private siteService         : SitesService,
    private menusService: MenusService,
    private userSwitchingService: UserSwitchingService,
    private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.user$ = this.authenticationService.user$.pipe(
    switchMap(data => { 
      this.user = data
      return of(data)
    }))
    this.getMenuGroup('customer')
  }

  navPOSOrders() {
    this.navigationService.navPOSOrders()
  }

  navProfile() {
    this.navigationService.navProfile()
  }
  logOut() { 
    this.userSwitchingService.clearLoggedInUser();
  }

  
  emailMailCount(event) {
    this.mailCount = event
  }

  getMenuGroup(name: string) {
    const site  =  this.siteService.getAssignedSite();
    if (!this.user) {return}
    const menu$ = this.menusService.getMainMenuByName(site, name);
    const accordionMenu$ = menu$.pipe(
      switchMap(data => { 
        this.currentMenu = data;
        return this.menusService.getMenuGroupByNameForEdit(site, name);
      }
    )).pipe(switchMap(data => { 
      this.accordionMenus = data
      return of(data)
    }));
  }

}
