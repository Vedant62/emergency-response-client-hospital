export interface AmbulanceData {
  ambulanceId: string;
  availability: string;
  location: { lat: number; lng: number };
  team: { paramedic: string; driver: string };
  equipment: string[];
}

export interface VitalsData {
  heartRate: number;
  bloodPressure: string;
  oxygenSaturation: number;
}

export interface EmergencyCase {
  caseId: string;
  ambulanceId: string;
  caseData: {
    patientInfo: {
      condition: string;
      age: number;
      gender: string;
      symptoms: string[];
    };
    severity: string;
    vitals: {
      heartRate: string;
      bloodPressure: string;
      oxygenSaturation: string;
    };
  };
} 