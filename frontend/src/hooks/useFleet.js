import { useState, useEffect } from 'react';
import { trucksService } from '../services/trucks';
import { driversService } from '../services/drivers';
import { fuelService } from '../services/fuel';
import { maintenanceService } from '../services/maintenance';
import { clientsService } from '../services/clients';
import { suppliersService } from '../services/suppliers';
import { tripsService } from '../services/trips';
import { stockService } from '../services/stock';

export function useFleet() {
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [stockRecords, setStockRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const [trucksRes, driversRes, fuelRes, maintenanceRes, clientsRes, suppliersRes, tripsRes, stockRes] = await Promise.all([
        trucksService.getAll(),
        driversService.getAll(),
        fuelService.getAll(),
        maintenanceService.getAll(),
        clientsService.getAll(),
        suppliersService.getAll(),
        tripsService.getAll(),
        stockService.getAll()
      ]);

      setTrucks(trucksRes.data || []);
      setDrivers(driversRes.data || []);
      setFuelRecords(fuelRes.data || []);
      setMaintenanceRecords(maintenanceRes.data || []);
      setClients(clientsRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setTrips(tripsRes.data || []);
      setStockRecords(stockRes.data || []);
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
    clients,
    suppliers,
    trips,
    stockRecords,
    loading,
    error,
    refetch: () => fetchData(true)
  };
}
