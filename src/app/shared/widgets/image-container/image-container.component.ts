import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'image-container',
  templateUrl: './image-container.component.html',
  styleUrls: ['./image-container.component.scss']
})
export class ImageContainerComponent implements OnInit {

  @Input() imageHeight: string;
  @Input() ariaLabel: string;
  @Input() containerDimensions = ''
  @Input() imageSource: string;

  constructor() { }

  ngOnInit(): void {
    const i=0
  }

}