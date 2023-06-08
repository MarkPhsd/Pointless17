import { Component, Input, OnInit, } from '@angular/core';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
let apiLoaded = false;
export interface playerConfig {
  controls: number;
  mute    : number;
  autoplay: number;
}
@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.scss'],
})
export class YoutubePlayerComponent implements OnInit {

  playerConfig: playerConfig;

  @Input() url       : string;
  @Input() autoPlay  : boolean;
  @Input() autoRepeat: boolean;
  @Input() chartHeight = '600px';
  @Input() chartWidth  = '100%';
  @Input() disableActions: boolean;

  constructor(public layoutService: GridsterLayoutService) { }

  ngOnInit(): void {
    if (this.layoutService.designerMode) {
      const playerConfig = {controls: 0, mute: 1, autoplay: 0}
      this.playerConfig = playerConfig;
      this.url = ''
    }
    this.chartWidth = '100%'
    this.enableVideo();
  }

  enableVideo() {
    let autoPlay = 0
    if (!this.layoutService.designerMode) {
      if (this.autoPlay)   { autoPlay = 1 }
      const playerConfig = {controls: 0, mute: 1, autoplay: autoPlay}
      this.playerConfig  = playerConfig;
      const i = 0

      this.chartWidth = '100%'

      if (!apiLoaded) {
        // This code loads the IFrame Player API code asynchronously, according to the instructions at
        // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
        apiLoaded = true;
      }
    }
  }

  toggleDesignMode() {
    this.layoutService.toggleDesignerMode(!this.layoutService.designerMode)
    this.enableVideo();
  }

  onReady(e): void {
    console.log(e, 'its ready')
  }

}
