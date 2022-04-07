import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-i-frame',
  templateUrl: './i-frame.component.html',
  styleUrls: ['./i-frame.component.scss'],

})
export class IFrameComponent implements OnInit {

  //<iframe class="w-100"
  //src="https://www.youtube.com/embed/KS76EghdCcY?rel=0&controls=0"
  //frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';

  urlSafe: any;
  // ?rel=0
  @Input() url        : string;
  @Input() chartHeight=  '100%';
  @Input() chartWidth =  '100%';
  @Input() disableActions: boolean;
  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit() {
    console.log(this.chartHeight)
    this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

}
