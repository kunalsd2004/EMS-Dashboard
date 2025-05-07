declare module 'firebase-admin' {
  export interface ServiceAccount {
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
  }

  export interface Credential {
    cert(serviceAccount: ServiceAccount): any;
  }

  export const credential: Credential;
}

declare module 'firebase-admin/app' {
  export interface App {
    name: string;
  }

  export function initializeApp(options: {
    credential: any;
    projectId?: string;
  }, name?: string): App;
}

declare module 'firebase-admin/messaging' {
  export interface Message {
    token: string;
    notification?: {
      title?: string;
      body?: string;
    };
    data?: { [key: string]: string };
    android?: {
      priority?: string;
    };
  }

  export interface Messaging {
    send(message: Message): Promise<string>;
  }

  export function getMessaging(): Messaging;
} 