// EMS-Dashboard/src/types/types.ts
export interface SOSAlert {
    id: string;
    location: {
      latitude: number;
      longitude: number;
    };
    contact: string;
    status: 'active' | 'resolved';
    timestamp: Date;
    showButton?: boolean;
  }

  interface ExtendedSOSAlert extends SOSAlert {
    locationName?: string;
  }
  // EMS-Dashboard/src/types.ts
  export interface Hospital {
      id: string;
      name: string;
      location: {
        latitude: number;
        longitude: number;
      };
    }
  
    export interface Report {
      id: string;
      contact: string;
      image?: string;
      imageUrl?: string;
      location: {
        latitude: number;
        longitude: number;
      };
      severity: string;
      timestamp: any; // Adjust type as needed
      userId: string;
      status: 'pending' | 'inProgress' | 'ambulanceDispatched' | 'resolved';
      type: string;
      title?: string; // <-- Optional now
      audio?: string;
      dashboardVisible?: boolean;
    }
    // types.ts
export interface AccidentDetection {
  id: string;
  imageUrl: string;
  timestamp: Date;
  confidence: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'detected' | 'verified' | 'false_positive';
  source: 'cctv';
  frame: number;
}
