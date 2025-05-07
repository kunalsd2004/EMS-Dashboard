export const playNotificationSound = (p0: string) => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => console.log('Error playing sound:', error));
  };