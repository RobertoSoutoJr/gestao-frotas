import { useState, useEffect } from 'react';
import { trucksService } from '../services/trucks';
import { driversService } from '../services/drivers';
import { fuelService } from '../services/fuel';
import { maintenanceService } from '../services/maintenance';

export function useFleet() {
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trucksRes, driversRes, fuelRes, maintenanceRes] = await Promise.all([
        trucksService.getAll(),
        driversService.getAll(),
        fuelService.getAll(),
        maintenanceService.getAll()
      ]);

      setTrucks(trucksRes.data || []);
      setDrivers(driversRes.data || []);
      setFuelRecords(fuelRes.data || []);
      setMaintenanceRecords(maintenanceRes.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    trucks,
    drivers,
    fuelRecords,
    maintenanceRecords,
    loading,
    error,
    refetch: fetchData
  };
}
