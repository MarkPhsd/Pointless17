import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AccordionMenu, MenuGroup, SubMenu }  from 'src/app/_interfaces/index';

@Injectable({
  providedIn: 'root'
})
export class FbNavMenuService {

  constructor(private fb: UntypedFormBuilder) { }

  initAccordionForm(inputForm: UntypedFormGroup) {
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

  initMenuGroupForm(inputForm: UntypedFormGroup) {

    inputForm = this.fb.group( {
      id:                    [''],
      name:                  [''],
      userType:              [''],
      accordionMenus:        [''],
    })
    return inputForm

  }

  initSubMenuForm(inputForm: UntypedFormGroup) {

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

  intitFormData(inputForm: UntypedFormGroup, data: any) {
    inputForm.patchValue(data)
  }


}
