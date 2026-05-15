import { useState, useEffect } from 'react';
import { trucksService } from '../services/trucks';
import { driversService } from '../services/drivers';
import { fuelService } from '../services/fuel';
import { maintenanceService } from '../services/maintenance';
import { clientsService } from '../services/clients';
import { suppliersService } from '../services/suppliers';
import { tripsService } from '../services/trips';
import { stockService } from '../services/stock';
import { oficinasService } from '../services/oficinas';
import { postosService } from '../services/postos';

const DEV_BYPASS = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

export function useFleet() {
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [stockRecords, setStockRecords] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [postos, setPostos] = useState([]);
  const [loading, setLoading] = useState(!DEV_BYPASS);
  const [error, setError] = useState(null);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const [trucksRes, driversRes, fuelRes, maintenanceRes, clientsRes, suppliersRes, tripsRes, stockRes, oficinasRes, postosRes] = await Promise.all([
        trucksService.getAll(),
        driversService.getAll(),
        fuelService.getAll(),
        maintenanceService.getAll(),
        clientsService.getAll(),
        suppliersService.getAll(),
        tripsService.getAll(),
        stockService.getAll(),
        oficinasService.getAll(),
        postosService.getAll()
      ]);

      setTrucks(trucksRes.data || []);
      setDrivers(driversRes.data || []);
      setFuelRecords(fuelRes.data || []);
      setMaintenanceRecords(maintenanceRes.data || []);
      setClients(clientsRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setTrips(tripsRes.data || []);
      setStockRecords(stockRes.data || []);
      setOficinas(oficinasRes.data || []);
      setPostos(postosRes.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (DEV_BYPASS) return;
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
    oficinas,
    postos,
    loading,
    error,
    refetch: () => fetchData(true)
  };
}
