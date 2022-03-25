import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-board',
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
