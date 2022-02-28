import { Component, OnInit,OnDestroy, OnChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IMenuButtonGroups, MBMenuButtonsService, mb_MenuButton } from 'src/app/_services/system/mb-menu-buttons.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subscription, switchMap } from 'rxjs';
import { IUser } from 'src/app/_interfaces';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-function-group-edit',
  templateUrl: './function-group-edit.component.html',
  styleUrls: ['./function-group-edit.component.scss']
})
export class FunctionGroupEditComponent implements OnInit,OnDestroy , OnChanges{

mb_MenuButton    = [] as mb_MenuButton[];
menuButtonGroup  : IMenuButtonGroups;
menuButton       : mb_MenuButton;
index            : number;

user              : IUser;
_user             : Subscription;
inputForm         : FormGroup;
initSubscription() {
  this._user = this.authenticationService.user$.subscribe( data => {
    this.user = data
  })
}

constructor(
    private menusService         : MBMenuButtonsService,
    private siteService          : SitesService,
    public route                 : ActivatedRoute,
    private authenticationService: AuthenticationService,
    private router: Router,
    private fb: FormBuilder,
    private _snackBar            : MatSnackBar){
}

  ngOnInit() {
    this.refreshButtons(null);

  }

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.refreshButtons(null);
    this.initFormFields();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._user) {
      this._user.unsubscribe()
    }
  }

  initFormFields() {
  if (!this.menuButtonGroup) { return }
   this.inputForm = this.fb.group({
     id          : [''],
     name        : [''],
     description : [''],
   })
   this.inputForm.patchValue(this.menuButtonGroup)
   console.log('init Form fields', this.menuButtonGroup)
  }

  saveGroup() {
    const site  =  this.siteService.getAssignedSite();
    try {
      if (!this.menuButtonGroup) { return }
      const group = this.inputForm.value as IMenuButtonGroups
      const group$ = this.menusService.putGroup(site, group);
      group$.subscribe( data => {
        this.refreshButtons(null)
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  addButton() {
    const site  =  this.siteService.getAssignedSite();
    try {
      if (!this.menuButtonGroup) { return }
      const button = {} as mb_MenuButton
      button.name = 'New Button'
      button.mb_MenuButtonGroupID = this.menuButtonGroup.id;
      const accordionMenu$ = this.menusService.postButton(site, button);
      accordionMenu$.subscribe( data => {
        this.refreshButtons(null)
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  refreshButtons(event) {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {return}
    this.getMainMenu(+id)
  }

  assignButton(item: mb_MenuButton) {
    this.menuButton = item;
  }

  getMainMenu(id: number){
    const site  =  this.siteService.getAssignedSite();
    try {
      const accordionMenu$ = this.menusService.getGroupByID(site, id);
      accordionMenu$.subscribe( data => {
        this.menuButtonGroup = data
        this.initFormFields();
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  deleteGroup() {
    const site       =  this.siteService.getAssignedSite();
    const result = window.confirm('Do you want to delete this entire group?')
    if (!result) { return }
    const group$ = this.menusService.deleteGroup(site, this.menuButtonGroup.id)
    group$.subscribe(data => {
      this.notifyEvent('Group deleted', 'Deleted');
      this.router.navigate(['function-group-list'])
      return
    })
  }

  assignSubMenu(event, sub: any) {

  }

  saveItem(event) {
    this.refreshButtons(null)
  }

  async initMenu() {
    const site       =  this.siteService.getAssignedSite();
    const result = window.confirm('Do you want to reset the menu?')

    // if (!result) {return}

    // if (this.user) {

    //   const deleteMenu = await this.menusService.deleteMenu(site).pipe().toPromise();
    //   const menu$      =  this.menusService.createMainMenu(this.user, site)
    //   const menu       =  await menu$.pipe().toPromise()

    //   //if the main menus hav ebeen created delete the sub menu's and make them also
    //   if (menu.id) {
    //     const clearMenu$ = this.menusService.deleteMenuGroup(site,menu.id)
    //     clearMenu$.pipe(switchMap (data => {
    //       return  this.menusService.createMainMenu(this.user, site)
    //       })).pipe(switchMap(menu => {
    //         return this.menusService.getMainMenu(site);
    //         })
    //       ).subscribe(accordionMenu=> {
    //         this.accordionMenus = accordionMenu
    //       })
    //     }
    //   }
    }

  dropAccordion(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.menuButtonGroup.mb_MenuButtons, event.previousIndex, event.currentIndex);
    this.saveAccordion()
  }

  drop(event: CdkDragDrop<string[]>) {
    // moveItemInArray(this.submenu, event.previousIndex, event.currentIndex);
    // this.saveSubMenu()
  }

  saveAccordion() {
    const site = this.siteService.getAssignedSite();
    if (!this.mb_MenuButton || !this.menuButtonGroup?.name) { return }
    if (this.mb_MenuButton) {
      const name =  this.menuButtonGroup.name.trimEnd()
      this.menusService.postButtonList(site, this.menuButtonGroup.mb_MenuButtons, name, true).subscribe( data=> {
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
