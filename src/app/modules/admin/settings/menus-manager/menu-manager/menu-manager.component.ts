import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit,OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AccordionMenu, IUser, MenuGroup, SubMenu } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MenusService } from 'src/app/_services/system/menus.service';
import { AccordionMenuItemEditComponent } from '../accordion-menu-item-edit/accordion-menu-item-edit.component';

// https://marceljuenemann.github.io/angular-drag-and-drop-lists/demo/#/nested
// https://material.angular.io/cdk/drag-drop/overview
// https://indepth.dev/posts/1291/building-interactive-lists-with-the-new-angular-7-drag-and-drop-tool

@Component({
  selector: 'app-menu-manager',
  templateUrl: './menu-manager.component.html',
  styleUrls: ['./menu-manager.component.scss']
})
export class MenuManagerComponent implements OnInit,OnDestroy  {

  menu$              :  Observable<MenuGroup[]>;
  accordionMenu$     :  Observable<AccordionMenu[]>;
  accordionMenuItem$ :  Observable<AccordionMenu>;
  accordionMenus     :  AccordionMenu[];
  submenu            :  SubMenu[];
  accordionMenu      :  AccordionMenu;
  submenuItem        :  SubMenu;
  user               :  IUser;
  _user              :  Subscription;

  initSubscription() {
    this._user = this.authenticationService.user$.subscribe( data => {
      this.user = data
    })
  }

  constructor(
              private dialog      : MatDialog,
              private menusService: MenusService,
              private siteService : SitesService,
              private authenticationService: AuthenticationService,
              private _snackBar   : MatSnackBar)
              {
  }

  ngOnInit() {
    this.initSubscription();
    this.getMainMenu()
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._user) {
      this._user.unsubscribe()
    }
  }

  getMainMenu(){
    const site  =  this.siteService.getAssignedSite();
    if (!this.user) {return}
    const accordionMenu$ = this.menusService.getMainMenu(site);
    accordionMenu$.subscribe( data => {
      this.accordionMenus = data
    })
  }

  refreshMenu() {
    this.getMainMenu();
  }

  assignSubMenuItem(event) {
    this.submenuItem = event
  }

  addAccordionMenu() {
    let id = 0;
    let menuGroupID = 0;
    if (this.accordionMenu) {
      menuGroupID = this.accordionMenus[0].menuGroupID
      id = this.accordionMenu.id
    }

    let dialogRef: any;
    const data = { id: id, menuGroupID: menuGroupID};
    const item = {} as AccordionMenu;
    item.menuGroupID = menuGroupID;
    this.menusService.updateAccordionMenuSubscription(item)

    dialogRef = this.dialog.open(AccordionMenuItemEditComponent,
      { width     : '600px',
        minWidth  : '600px',
        height    : '450px',
        minHeight : '450px',
        data      : data
      },
    )
  }

  addSubMenu() {
    const menu  = {} as SubMenu;
    menu.menuID = this.accordionMenu.id;
    const site  = this.siteService.getAssignedSite();
    this.menusService.postSubMenuItem(site, menu).subscribe(data => {
      this.accordionMenu.submenus.push(data)
      this.assignSubMenu(this.accordionMenu, this.accordionMenu.submenus)
    })
  }

  assignSubMenu(item: AccordionMenu, submenu: SubMenu[]) {
    const site         =  this.siteService.getAssignedSite();
    this.accordionMenu = item;
    this.accordionMenuItem$ = this.menusService.getAccordionMenuByID(site,item.id)
    this.submenu       = submenu;
  }

  initMenu() {
    const site          =  this.siteService.getAssignedSite();
    const result        = window.confirm('Do you want to reset the menu?')
    if (!result) {return}
    if (this.user) {
      const deleteMenu$ =  this.menusService.deleteMenu(site);
      deleteMenu$.pipe(switchMap( data => {
        return this.menusService.createMainMenu(this.user, site)
        }
      )).subscribe( data =>
        this.accordionMenus  = data.accordionMenus
      )
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
