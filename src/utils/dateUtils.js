export const DateUtils = {
  // Format date to Nothing OS style
  formatDateHeader(date) {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options).toUpperCase();
  },

  // Get today's date string (YYYY-MM-DD)
  getTodayString() {
    return new Date().toISOString().split('T')[0];
  },

  // Get tomorrow's date string
  getTomorrowString() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  },

  // Check if date is today
  isToday(dateString) {
    return dateString === this.getTodayString();
  },

  // Check if date is tomorrow
  isTomorrow(dateString) {
    return dateString === this.getTomorrowString();
  },

  // Get relative date display
  getRelativeDateDisplay(dateString) {
    if (this.isToday(dateString)) return 'TODAY';
    if (this.isTomorrow(dateString)) return 'TOMORROW';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).toUpperCase();
  }
};