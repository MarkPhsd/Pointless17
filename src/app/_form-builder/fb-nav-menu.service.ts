import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AccordionMenu, MenuGroup, SubMenu }  from 'src/app/_interfaces/index';

@Injectable({
  providedIn: 'root'
})
export class FbNavMenuService {

  constructor(private fb: FormBuilder) { }

  initAccordionForm(inputForm: FormGroup) {


    inputForm = this.fb.group( {
      id:                    [''],
      name:                  [''],
      icon:                  [''],
      active:                [''],
      sortOrder:             [''],
      menuGroupID:           [''],
      userType:              [''],
      routerLink:            [''],
      routerLinkActive:      [''],
      method:                [''],
      submenus:              [''],
    })
    return inputForm

  }

  initMenuGroupForm(inputForm: FormGroup) {

    inputForm = this.fb.group( {
      id:                    [''],
      name:                  [''],
      userType:              [''],
      accordionMenus:        [''],
    })
    return inputForm

  }

  initSubMenuForm(inputForm: FormGroup) {

    inputForm = this.fb.group( {
      id:                    [''],
      name:                  [''],
      routerLinkActive:      [''],
      routerLink:            [''],
      meunyType:             [''],
      icon:                  [''],
      onClick:               [''],
      sortOrder:             [''],
      menuID:                [''],
      submenuID:             [''],
      userType:              [''],
      method:                [''],
      minimized:             [''],
      submenus:              [''], //SubMenu[];
    })
    return inputForm

  }


  intitFormData(inputForm: FormGroup, data: any) {
    inputForm.patchValue(data)
  }


}
