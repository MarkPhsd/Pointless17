export type accordionConfig = {
  // selector?: String,
  multi?: boolean
};


export interface AccordionMenu {
  id:                   number;
  name:                 string;
  icon:                 string;
  active:               boolean;
  sortOrder:            number;
  menuGroupID:          number;
  userType:             string;
  routerLink:           string;
  routerLinkActive:     string;
  method:               string;
  submenus:             SubMenu[];
}

export interface MenuGroup {
  id:                   number;
  name:                 string;
  userType:             string;
  accordionMenus:       [];
}

export interface SubMenu {
  id:                   number;
  name:                 string,
  routerLinkActive:     string,
  routerLink:           string,
  meunyType:            number;
  icon:                 string;
  onClick:              string,
  sortOrder:            number;
  menuID:               number;
  submenuID:            number;
  userType:             string;
  method:               string;
  minimized:            boolean;
  submenus:             SubMenu[];
}
