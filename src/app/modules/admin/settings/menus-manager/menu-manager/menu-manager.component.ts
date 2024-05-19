import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit,OnDestroy } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, of, Subscription } from 'rxjs';
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
  currentMenu        : MenuGroup;
  currentMenuName    :  string = 'main';
  menuGroupID        : number;
  action$            :  Observable<any>;
  menus$              :  Observable<MenuGroup[]>;
  accordionMenu$     :  Observable<AccordionMenu[]>;
  accordionMenuItem$ :  Observable<AccordionMenu>;
  accordionMenus     :  AccordionMenu[];
  submenu            :  SubMenu[];
  accordionMenu      :  AccordionMenu;
  submenuItem        :  SubMenu;
  user               :  IUser;
  _user              :  Subscription;
  message            : string;

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
    this.currentMenuName = 'main'
    this.refreshMenu();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._user) {
      this._user.unsubscribe()
    }
  }

  getMenuGroup(name: string) {
    const site  =  this.siteService.getAssignedSite();
    console.log('this.user', this.user)
    if (!this.user) {return}
    const menu$ = this.menusService.getMainMenuByName(site, name);
    console.log('name',name)
    this.accordionMenu$ = menu$.pipe(
      switchMap(data => {
        console.log('menu', data)
        this.currentMenu = data;
        return this.menusService.getMenuGroupByNameForEdit(site, name);
      }
    )).pipe(switchMap(data => {
      if (!data) {  return of(null)  }
      console.log('data', data)
      this.accordionMenus = data
      return of(data)
    }));
  }

  onToggleChange(name: string) {
    this.getMenuGroup(name)
  };

  getMenuGroupList() {
    const site  =  this.siteService.getAssignedSite();
    this.menus$ = this.menusService.getMainMenuList(site);
  }

  refreshMenu() {
    this.getMenuGroupList();
    this.accordionMenus = null;
    this.accordionMenu  = null;
    this.getMenuGroup(this.currentMenuName);
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
    // this.submenuItem = {} as SubMenu;

    if (!item) { return }
    const site         =  this.siteService.getAssignedSite();
    this.accordionMenuItem$ = this.menusService.getAccordionMenuByID(site,item.id).pipe(
      switchMap(data => {
        this.accordionMenu = data;
        this.submenu = data.submenus
        return of(data)
      })
    )
  }

  initMenu() {
    const site          =  this.siteService.getAssignedSite();
    const result        = window.confirm('Do you want to reset the menu?')
    if (!result) {return}
    if (this.user) {
      const deleteMenu$ =  this.menusService.deleteMenu(site, 'main');
      deleteMenu$.pipe(switchMap( data => {
        return this.menusService.createMainMenu(this.user, site)
        }
      )).subscribe( data =>
        this.accordionMenus  = data.accordionMenus
      )
    }
  }

  initCustomerMenu() {
    const site          =  this.siteService.getAssignedSite();
    const result        = window.confirm('Do you want to reset the customer menu?')
    if (!result) {return}
    if (this.user) {
      const deleteMenu$ =  this.menusService.deleteMenu(site, 'customer');
      deleteMenu$.pipe(switchMap( data => {
        return this.menusService.createCustomerMainMenu(this.user, site)
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
