import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TtsService {
  private voicesLoaded = new BehaviorSubject<boolean>(false);
  private voices: SpeechSynthesisVoice[] = [];
  private textQueue$ = new BehaviorSubject<{ text: string, voiceName?: string }[]>([]);
  private isSpeaking: boolean = false;
  private defaultVoiceName: string = 'Microsoft Zira'; // Default voice

  constructor(private zone: NgZone) {
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
    this.defaultVoiceName = voiceName;
  }

  // Method to add text to the queue, optionally passing a voice name
  addTextToQueue(text: string, voiceName?: string) {
    // Add new text and its voice name (or default) to the queue
    this.textQueue$.next([...this.textQueue$.value, { text, voiceName }]);
  }

  // Process the queue, running speech synthesis outside Angular zone
  private processQueue() {
    this.textQueue$.subscribe((queue) => {
      if (!this.isSpeaking && queue.length > 0) {
        this.zone.runOutsideAngular(() => {
          const { text, voiceName } = queue[0];
          this.startSpeaking(text, voiceName || this.defaultVoiceName); // Use the passed or default voice
        });
      }
    });
  }

  // Method to start speaking the first item in the queue
  private startSpeaking(text: string, voiceName: string) {
    this.isSpeaking = true;

    const utterance = new SpeechSynthesisUtterance(text);

    // Find and set the voice based on voiceName (either default or passed voice)
    const selectedVoice = this.voices.find(voice => voice.name === voiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      this.zone.run(() => {
        this.isSpeaking = false;
        const updatedQueue = this.textQueue$.value.slice(1); // Remove the first item from the queue
        this.textQueue$.next(updatedQueue); // Update the queue
      });
    };

    speechSynthesis.speak(utterance);
  }
  // Expose the list of voices
  getVoices() {
    return this.voices;
  }

    // Observable to indicate when voices are loaded
    isVoicesLoaded() {
      return this.voicesLoaded.asObservable();
    }
}

