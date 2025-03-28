export interface SOSAlert {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  contact: string;
  timestamp: Date;
  status: 'active' | 'resolved';
}

interface ExtendedSOSAlert extends SOSAlert {
  locationName?: string;
}

// ../types.ts
export interface Report {
  locationName: string;
  description: string;
  audio: any;
  imageUrl: string;
  id: string;
  severity: string;
  contact: string;
  status: 'pending' | 'inProgress' | 'ambulanceDispatched';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  image: string;
  title: string;
  timestamp: any;
  userId: string;
  accidentDetails?: string;
  nearbyHospitals?: Hospital[];
  type: string;
  dashboardVisible?: boolean;
}
interface ReportData {
  id: string;
  title: string;
  location: {
    latitude: number;
    longitude: number;
  };
  locationName?: string;
  type: string;
  severity: string;
  status: string;
  timestamp: Date;
}

export interface Hospital {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface AnalyticsData {
  id: string;
  originalId: string;
  type: 'sos' | 'report';
  isArchived: boolean;
  archivedAt: Date;
  // ... other fields ...
}

