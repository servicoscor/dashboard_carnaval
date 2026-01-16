export type WazeAlertType = 'JAM' | 'ACCIDENT' | 'ROAD_CLOSED' | 'HAZARD';

export interface WazeAlert {
  uuid: string;
  type: WazeAlertType;
  subtype: string;
  street?: string;
  city?: string;
  location: {
    x: number; // longitude
    y: number; // latitude
  };
  reliability: number;
  confidence: number;
  reportRating: number;
  pubMillis: number;
  reportDescription?: string;
}

export interface WazeFeed {
  alerts: WazeAlert[];
}
