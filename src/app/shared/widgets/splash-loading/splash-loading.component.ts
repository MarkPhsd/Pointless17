import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SplashScreenStateService } from 'src/app/_services/system/splash-screen-state.service';
import { AppMaterialModule } from 'src/app/app-material.module';

@Component({
  selector: 'app-splash-loading',
  standalone: true,
  imports: [CommonModule,FormsModule ,],
  templateUrl: './splash-loading.component.html',
  styleUrls: ['./splash-loading.component.scss']
})
export class SplashLoadingComponent implements OnInit {

  @ViewChild('splashScreen') splashScreen: TemplateRef<any>;
  indexvalue = 'index-top'
  // The screen starts with the maximum opacity
  public opacityChange = 1;
  public splashTransition;
  // First access the splash is visible
  public showSplash = true;
  readonly ANIMATION_DURATION = 1;

  constructor(public splashScreenStateService: SplashScreenStateService) { }

  ngOnInit(): void {
    // Somewhere the stop method has been invoked
    this.splashScreenStateService.start()
    this.splashScreenStateService.subscribe(res => {
       this.hideSplashAnimation();
    });
 }

 hideSplashAnimation() {
    // Setting the transition
    this.splashTransition = `opacity ${this.ANIMATION_DURATION}s`;
    this.opacityChange = 0;
    this.indexvalue = 'index-top'
    setTimeout(() => {
       // After the transition is ended the showSplash will be hided
       this.showSplash = !this.showSplash;
       this.indexvalue = 'index-bottom';
    }, 500);
 }

 get isSplashScreen() {

  if (this.showSplash) {
    return this.splashScreen
  }
  return null;
}

}
