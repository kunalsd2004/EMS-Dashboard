// Notification sound utility for web
type SoundType = "sos" | "report" | "info"

class NotificationSoundService {
  private static instance: NotificationSoundService
  private audioElements: Map<SoundType, HTMLAudioElement> = new Map()
  private isEnabled = true

  // Default sound URLs - replace with your own sound files if needed
  private soundUrls: Record<SoundType, string> = {
    sos: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3", // Emergency alarm
    report: "https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3", // Alert notification
    info: "https://assets.mixkit.co/active_storage/sfx/2866/2866-preview.mp3", // Info notification
  }

  private constructor() {
    // Pre-load audio elements
    this.initAudioElements()
  }

  public static getInstance(): NotificationSoundService {
    if (!NotificationSoundService.instance) {
      NotificationSoundService.instance = new NotificationSoundService()
    }
    return NotificationSoundService.instance
  }

  private initAudioElements(): void {
    Object.entries(this.soundUrls).forEach(([type, url]) => {
      const audio = new Audio(url)
      audio.preload = "auto"
      this.audioElements.set(type as SoundType, audio)
    })
  }

  public play(type: SoundType, message?: string): void {
    if (!this.isEnabled) return

    const audio = this.audioElements.get(type)
    if (audio) {
      // Stop any currently playing sounds
      this.stopAll()

      // Play the requested sound
      audio.currentTime = 0
      audio.play().catch((error) => {
        console.error("Error playing notification sound:", error)
      })

      // Show browser notification if supported and message is provided
      if (message && "Notification" in window && Notification.permission === "granted") {
        new Notification("EMS Alert", {
          body: message,
          icon: "/logo1.png",
        })
      }
    }
  }

  public stopAll(): void {
    this.audioElements.forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
    })
  }

  public enable(): void {
    this.isEnabled = true
  }

  public disable(): void {
    this.isEnabled = false
    this.stopAll()
  }

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled
    if (!this.isEnabled) {
      this.stopAll()
    }
    return this.isEnabled
  }

  public requestNotificationPermission(): void {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission()
    }
  }
}

export const notificationSound = NotificationSoundService.getInstance()

