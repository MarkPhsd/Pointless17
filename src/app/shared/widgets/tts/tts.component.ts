import { Component, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { TtsService } from 'src/app/_services/system/tts-service.service';

@Component({
  selector: 'app-tts-component',
  template: `
    <button (click)="addText()">Add Text to Queue</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TtsComponent {
  constructor(private ttsService: TtsService, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  addText() {
    this.zone.runOutsideAngular(() => {
      this.ttsService.addTextToQueue('This is a test text to speak.', 'Microsoft Zira');
    });
  }

  // Optionally detach change detection for further optimization
  ngOnInit() {
    this.cdr.detach();
  }
}
