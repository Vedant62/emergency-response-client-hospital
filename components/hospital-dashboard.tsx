'use client'

import React from 'react'
import { Search, Ambulance, Map, Activity, PhoneCall } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AmbulanceData, EmergencyCase, VitalsData } from '@/app/types/emergency'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils'
import { AmbulanceMap } from '@/components/ambulance-map'

interface HospitalDashboardProps {
  ambulances: Record<string, AmbulanceData>;
  emergencyCases: Record<string, EmergencyCase>;
  vitalsData: Record<string, VitalsData>;
}

export function HospitalDashboardComponent({
  ambulances,
  emergencyCases,
  vitalsData
}: HospitalDashboardProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-4 hidden md:block">
        <h2 className="text-2xl font-bold mb-4">Hospital Dashboard</h2>
        <nav>
          <Button variant="ghost" className="w-full justify-start mb-2">
            <Ambulance className="mr-2 h-4 w-4" />
            Ambulances
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-2">
            <Map className="mr-2 h-4 w-4" />
            Map View
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-2">
            <Activity className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Ambulance Dashboard</h1>
          <div className="flex items-center">
            <Input className="mr-2" placeholder="Search..." />
            <Button size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Ambulance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(ambulances).map(([id, ambulance]) => (
            <Card key={id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  Ambulance {ambulance.ambulanceId}
                </CardTitle>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <PhoneCall className="mr-2 h-4 w-4" />
                      Contact Crew
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Start video call?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will initiate a video call with the crew of Ambulance {ambulance.ambulanceId}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Start Call</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ",
                      ambulance.availability.toLowerCase() === 'engaged' 
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                    )}>
                      <div className={cn(
                        "mr-1 h-1.5 w-1.5 rounded-full",
                        ambulance.availability.toLowerCase() === 'engaged' 
                          ? "bg-green-400" 
                          : "bg-yellow-400"
                      )} />
                      {ambulance.availability}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Location: {`${ambulance.location.lat}, ${ambulance.location.lng}`}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Team: {`${ambulance.team.paramedic}, ${ambulance.team.driver}`}
                    </p>
                  </div>
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <AmbulanceMap ambulance={ambulance} />
                  </div>
                </div>

                {/* Case Information - You'll need to match this with the corresponding emergency case */}
                {Object.values(emergencyCases)
                  .filter(eCase => eCase.ambulanceId === ambulance.ambulanceId)
                  .map(eCase => (
                    <div key={eCase.caseId} className="border-t pt-4">
                      <h3 className="font-semibold mb-2">Case #{eCase.caseId}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p><span className="font-medium">Condition:</span> {eCase.caseData.patientInfo.condition}</p>
                          <p><span className="font-medium">Age:</span> {eCase.caseData.patientInfo.age}</p>
                          <p><span className="font-medium">Gender:</span> {eCase.caseData.patientInfo.gender}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Card>
                            <CardContent className="p-2">
                              <div className="text-xs font-medium">Heart Rate</div>
                              <div className="text-sm font-bold">
                                {vitalsData[`${ambulance.ambulanceId}-${eCase.caseId}`]?.heartRate || eCase.caseData.vitals.heartRate}
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-2">
                              <div className="text-xs font-medium">Blood Pressure</div>
                              <div className="text-sm font-bold">
                                {vitalsData[`${ambulance.ambulanceId}-${eCase.caseId}`]?.bloodPressure || eCase.caseData.vitals.bloodPressure}
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-2">
                              <div className="text-xs font-medium">O2 Sat</div>
                              <div className="text-sm font-bold">
                                {(vitalsData[`${ambulance.ambulanceId}-${eCase.caseId}`]?.oxygenSaturation || 
                                  Number(eCase.caseData.vitals.oxygenSaturation)).toFixed(2)}%
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}