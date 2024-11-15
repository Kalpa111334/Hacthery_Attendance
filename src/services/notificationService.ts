class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.init();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    this.permission = await Notification.permission;
    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public async notify(title: string, options?: NotificationOptions) {
    if (!('Notification' in window)) return;

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    try {
      new Notification(title, {
        icon: '/vite.svg',
        ...options
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  public async notifyCheckIn(user: User) {
    await this.notify(`Welcome ${user.name}!`, {
      body: `You've successfully checked in at ${new Date().toLocaleTimeString()}`,
      tag: 'check-in'
    });
  }

  public async notifyCheckOut(user: User) {
    await this.notify(`Goodbye ${user.name}!`, {
      body: `You've successfully checked out at ${new Date().toLocaleTimeString()}`,
      tag: 'check-out'
    });
  }

  public async notifyLateArrival(user: User) {
    await this.notify('Late Arrival', {
      body: `${user.name} has arrived late at ${new Date().toLocaleTimeString()}`,
      tag: 'late-arrival'
    });
  }

  public async notifyNewEmployee(name: string) {
    await this.notify('New Employee Added', {
      body: `${name} has been successfully registered`,
      tag: 'new-employee'
    });
  }
}

// Export the NotificationService class as the default export
export default NotificationService;
