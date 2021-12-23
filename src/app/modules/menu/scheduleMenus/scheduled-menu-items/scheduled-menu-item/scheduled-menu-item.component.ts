import { Component, Input, OnInit } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';

@Component({
  selector    : 'scheduled-menu-item',
  templateUrl  : './scheduled-menu-item.component.html',
  styleUrls   : ['./scheduled-menu-item.component.scss']
})
export class ScheduledMenuItemComponent implements OnInit {

  @Input() menuItem: IMenuItem;
  @Input() imagePath: string;
  @Input() imageName: string;
  @Input() isApp    : boolean;
  bucket: string;
  url: string;
  gridflowapp = "grid-flow"

   async ngOnInit() {
    // if  (this.imageName  != '' && this.imagePath != '') { return }
    if (this.imageName) {
      this.url = `${this.imagePath}${this.imageName}`
    }

    if (this.isApp) {
      this.gridflowapp = 'grid-flow-app'
    }
  }


}

