import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/shared/Button';
import { forecastApi } from '../api/forecastApi';
import { inventoryApi } from '../api/inventoryApi';
import { TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const ForecastingPage = () => {
  const [forecasts, setForecasts] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fcRes, itemRes, locRes] = await Promise.all([
        forecastApi.getForecasts(),
        inventoryApi.getItems(),
        inventoryApi.getLocations()
      ]);
      setForecasts(fcRes.forecasts || []);
      setItems(itemRes.items || []);
      setLocations(locRes.locations || []);
      if (itemRes.items?.length > 0 && !selectedItem) {
        setSelectedItem(itemRes.items[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateForecast = async () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      await forecastApi.generateForecast({
        itemId: selectedItem,
        locationId: locations[0]?._id,
        targetServiceLevel: 0.95
      });
      alert('Demand forecast model executed successfully!');
      loadData();
    } catch (err) {
      alert(err.message || 'Forecast generation failed');
      setLoading(false);
    }
  };

  const chartData = [
    { period: '2026-03', actual: 140, forecast: 140, lower: 120, upper: 160 },
    { period: '2026-04', actual: 160, forecast: 160, lower: 140, upper: 180 },
    { period: '2026-05', actual: 210, forecast: 215, lower: 190, upper: 240 },
    { period: '2026-06', actual: 195, forecast: 200, lower: 175, upper: 225 },
    { period: '2026-07', actual: 230, forecast: 235, lower: 210, upper: 260 },
    { period: '2026-08 (Est)', actual: null, forecast: 280, lower: 250, upper: 310 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Predictive Demand Forecasting (HarvestIQ-DemandNet)"
        description="Driver-based forecasting incorporating acreage commitments, crop growth stages, seasonality, and historical consumption."
        actions={
          <div className="flex items-center gap-3">
            <select
              value={selectedItem}
              onChange={e => setSelectedItem(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            >
              {items.map(i => <option key={i._id} value={i._id}>{i.name} ({i.sku})</option>)}
            </select>
            <Button variant="primary" size="sm" onClick={handleGenerateForecast} isLoading={loading}>
              <Sparkles className="w-4 h-4 mr-1" />
              Run Demand Model
            </Button>
          </div>
        }
      />

      {/* Forecast Chart */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Demand Forecast & Confidence Interval</h3>
        <p className="text-xs text-slate-500 mb-6">Historical demand baseline vs. 95% statistical confidence envelope</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Area type="monotone" dataKey="upper" name="Upper Confidence Interval (95%)" stroke="#86efac" fill="#dcfce7" fillOpacity={0.4} />
              <Area type="monotone" dataKey="forecast" name="Predicted Demand" stroke="#16a34a" fill="#22c55e" fillOpacity={0.6} />
              <Area type="monotone" dataKey="actual" name="Historical Demand" stroke="#0284c7" fill="#38bdf8" fillOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
            <tr>
              <th className="p-4">SKU / Item</th>
              <th className="p-4">Period</th>
              <th className="p-4">Predicted Demand</th>
              <th className="p-4">Confidence Interval</th>
              <th className="p-4">Confidence Score</th>
              <th className="p-4">Drivers & Assumptions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {forecasts.map(fc => (
              <tr key={fc._id}>
                <td className="p-4 font-bold">{fc.itemName}</td>
                <td className="p-4 font-mono">{fc.forecastPeriod}</td>
                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{fc.forecastQuantity} Units</td>
                <td className="p-4 text-slate-500">[{fc.confidenceIntervalLower} - {fc.confidenceIntervalUpper}]</td>
                <td className="p-4 font-semibold">{Math.round((fc.confidenceScore || 0.88) * 100)}%</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{fc.explanation || 'Driver: Acreage + Seasonality'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
