import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'image-container',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
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
