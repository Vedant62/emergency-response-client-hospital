'use client';

import { HospitalDashboardComponent } from "@/components/hospital-dashboard"
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Type definitions for our data structures
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

export default function Page() {
  // State to track all our data
  const [ambulances, setAmbulances] = useState<Record<string, AmbulanceData>>({});
  const [emergencyCases, setEmergencyCases] = useState<Record<string, EmergencyCase>>({});
  const [vitalsData, setVitalsData] = useState<Record<string, VitalsData>>({});

  useEffect(() => {
    let socket: Socket;
    
    try {
      // Initialize socket connection
      socket = io('https://emergency-response-server-wiz.onrender.com', {
        transports: ['websocket'],
        reconnection: true,        // Enable auto-reconnection
        reconnectionAttempts: 5,   // Number of reconnection attempts
        timeout: 10000            // Connection timeout in ms
      });

      socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        socket.emit('joinRoom', { roomId: 'hospital_staff' });
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from Socket.IO server:', reason);
      });

      // Handle ambulance updates
      socket.on('ambulanceListUpdate', ({ ambulanceId, ambulanceData }) => {
        console.log('ambulanceListUpdate', ambulanceId, ambulanceData);
        setAmbulances(prev => ({
          ...prev,
          [ambulanceId]: ambulanceData
        }));
      });

      // Handle new emergency cases
      socket.on('newEmergencyCase', ({ caseId, ambulanceId, caseData }) => {
        console.log('Received newEmergencyCase:', { caseId, ambulanceId, caseData });
        setEmergencyCases(prev => ({
          ...prev,
          [caseId]: { caseId, ambulanceId, caseData }
        }));
      });

      // Handle vitals updates
      socket.on('vitalsUpdate', ({ ambulanceId, caseId, vitalsData }) => {
        console.log('Received vitalsUpdate:', { ambulanceId, caseId, vitalsData });
        setEmergencyCases(prev => {
          const updatedCases = { ...prev };
          if (updatedCases[caseId]) {
            updatedCases[caseId] = {
              ...updatedCases[caseId],
              caseData: {
                ...updatedCases[caseId].caseData,
                vitals: {
                  heartRate: vitalsData.heartRate.toString(),
                  bloodPressure: vitalsData.bloodPressure,
                  oxygenSaturation: vitalsData.oxygenSaturation.toString()
                }
              }
            };
          }
          return updatedCases;
        });
      });

      // Handle location updates
      socket.on('ambulanceLocationUpdate', ({ ambulanceId, locationData }) => {
        console.log('ambulanceLocationUpdate', {ambulanceId, locationData});
        setAmbulances(prev => {
          if (!prev[ambulanceId]) return prev;
          
          const updatedAmbulances = {
            ...prev,
            [ambulanceId]: {
              ...prev[ambulanceId],
              location: {
                lat: Number(locationData.lat),
                lng: Number(locationData.lng)
              }
            }
          };
          console.log('Updated ambulances:', updatedAmbulances);
          return updatedAmbulances;
        });
      });

    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }

    // Clean up socket connection on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return <HospitalDashboardComponent 
    ambulances={ambulances}
    emergencyCases={emergencyCases}
    vitalsData={vitalsData}
  />
}