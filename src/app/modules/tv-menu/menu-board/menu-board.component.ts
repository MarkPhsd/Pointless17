import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { StrainBoardComponent } from '../strainBoard/strain-board/strain-board.component';
import { TypeBoardComponent } from '../type-board/type-board.component';

@Component({
  selector: 'app-menu-board',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
StrainBoardComponent,TypeBoardComponent,
  ],

  templateUrl: './menu-board.component.html',
  styleUrls: ['./menu-board.component.scss']
})
export class MenuBoardComponent implements OnInit {
  backgroundImage: any// 'https://naturesherbs.s3-us-west-1.amazonaws.com/splash-woman-on-rock-1.jpg'

  constructor() { }

  ngOnInit(): void {
    this.assingBackGround('')
  }
  assingBackGround(image: string) {
    if (!image) {
      image = 'https://naturesherbs.s3-us-west-1.amazonaws.com/splash-woman-on-rock-1.jpg'
     }
    const styles = { 'background-image': `url(${image})`};
    this.backgroundImage = styles
    const i = 1
  }

}
