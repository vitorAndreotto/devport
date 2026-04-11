export interface State {
  id: number;
  abbr: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
}

export interface City {
  id: number;
  stateId: number;
  name: string;
  latitude: number;
  longitude: number;
  isCapital: boolean;
  siafiId: number;
  ddd: number;
  timezone: string;
}
