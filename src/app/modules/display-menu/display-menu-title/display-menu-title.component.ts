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
  }

  navItem(event) {

  }

}
