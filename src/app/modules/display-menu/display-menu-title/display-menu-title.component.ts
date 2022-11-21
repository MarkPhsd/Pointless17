import { Component, Input, OnInit } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { IDisplayMenu } from 'src/app/_interfaces/menu/price-schedule';
import { AWSBucketService } from 'src/app/_services';
@Component({
  selector: 'display-menu-title',
  templateUrl: './display-menu-title.component.html',
  styleUrls: ['./display-menu-title.component.scss']
})
export class DisplayMenuTitleComponent implements OnInit {

  @Input() menu : IDisplayMenu;
  obs$ : Observable<any>[];
  @Input() bucket: string;

  backgroundURL: string
  style: string;

  getItemSrc(nameArray: string) {
    if (!this.bucket) { return }
    return this.awsBucket.getImageURLFromNameArray(this.bucket, nameArray)
  }

  getPlaceHolder() {
    return this.awsBucket.getPlaceHolderImage() // this.placeHolderImage
  }

  constructor( private awsBucket         : AWSBucketService,) { }

  ngOnInit(): void {
    const i = 0
    this.loadStyles()
    if (this.menu?.backgroundImage) {
      // this.menu.backcolorOpacity
      const image =    this.awsBucket.getImageURLPathAlt(this.bucket, this.menu?.backgroundImage)
      this.backgroundURL = `url(${image})`
    }
  }

  navItem(event) {

  }

  loadStyles() {
    // const styles = this.menu.css;
    // if (!this.menu?.css) {return }
    // const style = document.createElement('style');
    // style.innerHTML = styles;
    // document.head.appendChild(style);

    // console.log(style)
  }

}
