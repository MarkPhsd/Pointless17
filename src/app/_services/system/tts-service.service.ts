import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root',
})
export class TtsService {
  private voicesLoaded = new BehaviorSubject<boolean>(false);
  private voices: SpeechSynthesisVoice[] = [];
  private textQueue$ = new BehaviorSubject<{ text: string, voiceName?: string }[]>([]);
  private isSpeaking: boolean = false;
  private defaultVoiceName: string = 'Microsoft Zira'; // Default voice

  constructor(private zone: NgZone,
              private PlatformService: PlatformService,
  ) {
    //only use with electron
    if (!this.PlatformService.isAppElectron) { return   }

    this.initVoices();
    this.processQueue();
  }

  // Initialize voices and listen for changes
  private initVoices() {


    speechSynthesis.onvoiceschanged = () => {
      this.voices = speechSynthesis.getVoices();
      this.voicesLoaded.next(true); // Notify that voices are loaded
    };

    if (speechSynthesis.getVoices().length > 0) {
      this.voices = speechSynthesis.getVoices();
      this.voicesLoaded.next(true);
    }
  }

  // Method to set the default voice
  setDefaultVoice(voiceName: string) {
    if (!voiceName) { return }
    this.defaultVoiceName = voiceName;
  }

  // Method to add text to the queue, optionally passing a voice name
  addTextToQueue(text: string, voiceName?: string) {
    // Add new text and its voice name (or default) to the queue

    // this.defaultVoiceName = 'Microsoft Mark - English (United States)';
    if (!voiceName) {
      voiceName = 'Microsoft Mark - English (United States)';
    }

    this.textQueue$.next([...this.textQueue$.value, { text, voiceName }]);
  }

  // Process the queue, running speech synthesis outside Angular zone
  private processQueue() {
    this.textQueue$.subscribe((queue) => {
      console.log(queue)
      if (!this.isSpeaking && queue.length > 0) {
        this.zone.runOutsideAngular(() => {
          const { text, voiceName } = queue[0];
          console.log(queue, voiceName || this.defaultVoiceName)
          this.startSpeaking(text, voiceName || this.defaultVoiceName); // Use the passed or default voice
        });
      }
    });
  }


  private startSpeaking(text: string, voiceName?: string) {
    this.isSpeaking = true;

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = this.voices.find(voice => voice.name === (voiceName || this.defaultVoiceName));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      console.log('Utterance ended, resetting isSpeaking');
      this.isSpeaking = false; // Reset flag to allow next message to be spoken
      this.processNextInQueue(); // Trigger the next item in the queue
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      this.isSpeaking = false; // Ensure the flag is reset in case of an error
      this.processNextInQueue();
    };

    console.log('Speaking:', text);
    speechSynthesis.speak(utterance);
  }

  private processNextInQueue() {
    const updatedQueue = this.textQueue$.value.slice(1); // Remove the first item from the queue
    this.textQueue$.next(updatedQueue); // Update the queue
    if (updatedQueue.length > 0) {
      this.startSpeaking(updatedQueue[0].text, updatedQueue[0].voiceName); // Start the next item in the queue
    }
  }

  // private startSpeaking(text: string, voiceName?: string) {
  //   this.isSpeaking = true;

  //   const utterance = new SpeechSynthesisUtterance(text);


  //   // Assign the selected voice or fall back to the default voice
  //   const selectedVoiceName = voiceName || this.defaultVoiceName;
  //   const selectedVoice = this.voices.find(voice => voice.name === selectedVoiceName);

  //   if (selectedVoice) {
  //     utterance.voice = selectedVoice;
  //   } else {
  //     console.warn(`Voice "${selectedVoiceName}" not found, using system default voice.`);
  //   }

  //   utterance.onend = () => {
  //     this.zone.run(() => {
  //       this.isSpeaking = false;
  //       const updatedQueue = this.textQueue$.value.slice(1); // Remove the first item from the queue
  //       this.textQueue$.next(updatedQueue); // Update the queue
  //     });
  //   };

  //   console.log('Selected voice:', selectedVoice ? selectedVoice.name : 'Default system voice');
  //   speechSynthesis.speak(utterance);
  // }


  // Expose the list of voices
  getVoices() {
    return this.voices;
  }

    // Observable to indicate when voices are loaded
    isVoicesLoaded() {
      return this.voicesLoaded.asObservable();
    }
}

