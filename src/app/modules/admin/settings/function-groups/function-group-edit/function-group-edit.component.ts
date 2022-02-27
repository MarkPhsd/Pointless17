import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IMenuButtonGroups, MBMenuButtonsService, mb_MenuButton } from 'src/app/_services/system/mb-menu-buttons.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-function-group-edit',
  templateUrl: './function-group-edit.component.html',
  styleUrls: ['./function-group-edit.component.scss']
})
export class FunctionGroupEditComponent implements OnInit {

mb_MenuButton    = [] as mb_MenuButton[];
menuButtonGroup  = {} IMenuButtonGroups;
constructor(
    private menusService         : MBMenuButtonsService,
    private siteService          : SitesService,
    public route                 : ActivatedRoute,
    private authenticationService: AuthenticationService,
    private _snackBar            : MatSnackBar){
}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {return}
    this.getMainMenu(+id)
  }

  getMainMenu(id: number){
    const site  =  this.siteService.getAssignedSite();
    const accordionMenu$ = this.menusService.getGroupByID(site, id);
    accordionMenu$.subscribe( data => {
      this.menuButtonGroup = data
    })
  }


  async initMenu() {
    const site       =  this.siteService.getAssignedSite();

    const result = window.confirm('Do you want to reset the menu?')

    if (!result) {return}

    if (this.user) {

      const deleteMenu = await this.menusService.deleteMenu(site).pipe().toPromise();
      const menu$      =  this.menusService.createMainMenu(this.user, site)
      const menu       =  await menu$.pipe().toPromise()

      //if the main menus hav ebeen created delete the sub menu's and make them also
      if (menu.id) {
        const clearMenu$ = this.menusService.deleteMenuGroup(site,menu.id)
        clearMenu$.pipe(switchMap (data => {
          return  this.menusService.createMainMenu(this.user, site)
          })).pipe(switchMap(menu => {
            return this.menusService.getMainMenu(site);
            })
          ).subscribe(accordionMenu=> {
            this.accordionMenus = accordionMenu
          })
        }
      }
    }

  dropAccordion(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.menuButtonGroup, event.previousIndex, event.currentIndex);
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
