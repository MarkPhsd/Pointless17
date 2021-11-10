import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription } from 'rxjs';

import { AccordionMenu, IUser, MenuGroup, SubMenu } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MenusService } from 'src/app/_services/system/menus.service';
import { SystemService } from 'src/app/_services/system/system.service';

// https://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/nested
// https://material.angular.io/cdk/drag-drop/overview
// https://indepth.dev/posts/1291/building-interactive-lists-with-the-new-angular-7-drag-and-drop-tool

@Component({
  selector: 'app-menu-manager',
  templateUrl: './menu-manager.component.html',
  styleUrls: ['./menu-manager.component.scss']
})
export class MenuManagerComponent implements OnInit  {

  menu$:           Observable<MenuGroup[]>;

  accordionMenu$:  Observable<AccordionMenu[]>;
  accordionMenus:  AccordionMenu[];
  submenu:         SubMenu[];

  accordionMenu : AccordionMenu;
  submenuItem   : SubMenu;

  user              : IUser;
  _user             : Subscription;

  initSubscription() {
    this._user = this.authenticationService.user$.subscribe( data => {
      this.user = data
    })
  }

  constructor(
              private menusService: MenusService,
              private siteService: SitesService,
              private authenticationService: AuthenticationService,
              private _snackBar: MatSnackBar){
  }

  ngOnInit() {
    this.getMainMenu()
  }

  getMainMenu(){
    const site  =  this.siteService.getAssignedSite();
    if (!this.user) {return}
    console.log('MenuManagerComponent getmenu => user', this.user)
    const accordionMenu$ = this.menusService.getMainMenu(site, this.user);

    accordionMenu$.subscribe( data => {
      this.accordionMenus = data
    })
  }

  assignSubMenuItem(event) {
    this.submenuItem       = event
  }

  assignSubMenu(item: AccordionMenu, submenu: SubMenu[]) {
    this.submenu       = submenu;
    this.accordionMenu = item;
    this.submenuItem   = null;
  }

  async initMenu() {

    const result = window.confirm('Do you want to reset the menu?')

    if (!result) {return}

    const site       =  this.siteService.getAssignedSite();
    const deleteMenu = await this.menusService.deleteMenu(site).pipe().toPromise();
    const menu$      =  this.menusService.createMainMenu(site)
    const menu       =  await menu$.pipe().toPromise()

    if (menu.id) {
      const clearMenu$ = this.menusService.deleteMenuGroup(site,menu.id)
      clearMenu$.subscribe(data => {
        const menu$ =  this.menusService.createMainMenu(site)
        this.getMainMenu();
      })
    }

  }

  dropAccordion(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.accordionMenus, event.previousIndex, event.currentIndex);
    this.saveAccordion()
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.submenu, event.previousIndex, event.currentIndex);
    this.saveSubMenu()
  }

  saveSubMenu() {
    const site = this.siteService.getAssignedSite();
    //then take the submenu
    //loop through it
    //assign the sortOrder the number of the index.
    if (this.submenu) {
      this.menusService.putSubMenuGrouplist(site, this.submenu).subscribe( data=> {
        console.log(this.submenu)
      })
    }
  }

  saveAccordion() {
    const site = this.siteService.getAssignedSite();
    if (this.accordionMenus) {
      this.menusService.putAccordionMenulist(site, this.accordionMenus).subscribe( data=> {
        console.log(this.accordionMenus)
      })
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
