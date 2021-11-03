export class TabsOverviewExample {

  selectedIndex: number = 1;

  selectChange(): void{
    console.log("Selected INDEX: " + this.selectedIndex);
  }

  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };

  // Action triggered when user swipes
  swipe(selectedIndex: number, action = this.SWIPE_ACTION.RIGHT) {
    // Out of range
    if (this.selectedIndex < 0 || this.selectedIndex > 1 ) return;

    // Swipe left, next tab
    if (action === this.SWIPE_ACTION.LEFT) {
      const isLast = this.selectedIndex === 1;
      this.selectedIndex = isLast ? 0 : this.selectedIndex + 1;
      console.log("Swipe right - INDEX: " + this.selectedIndex);
    }

    // Swipe right, previous tab
    if (action === this.SWIPE_ACTION.RIGHT) {
      const isFirst = this.selectedIndex === 0;
      this.selectedIndex = isFirst ? 1 : this.selectedIndex - 1;
    }
  }
}
