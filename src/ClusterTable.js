// ClusterTable.js
import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';


const ClusterTable = ({ clusterInfo, onRemove, currency, conversionRates, onEdit, globalMetrics, onMetricsUpdate, index }) => {
  const [metrics, setMetrics] = useState([]);
  const [openCostData, setOpenCostData] = useState([]);
  const [containerList, setContainerList] = useState([]);

  const metricColumns = [
    { name: 'cpuUsage', displayName: 'CPU Usage' },
    { name: 'memoryUsage', displayName: 'Memory Usage' },
    { name: 'networkRxBytes', displayName: 'Network Rx' },
    { name: 'networkTxBytes', displayName: 'Network Tx' },
    { name: 'diskUsage', displayName: 'Disk Usage' },
    { name: 'cpuEfficiency', displayName: 'CPU Eff' },
    { name: 'ramEfficiency', displayName: 'RAM Eff' },
    { name: 'totalEfficiency', displayName: 'Total Eff' },
    { name: 'nodeResourceAlloc', displayName: 'Node Res Alloc' },
    { name: 'cpuCost', displayName: 'CPU Cost' },
    { name: 'ramCost', displayName: 'RAM Cost' },
    { name: 'pvCost', displayName: 'PV Cost' },
    { name: 'totalCost', displayName: 'Total Cost' },
  ];

  const fetchPrometheusMetric = async (prometheusUrl, query) => {
    try {
      console.log(`${prometheusUrl}/api/v1/query?query=${encodeURIComponent(query)}`)
      const response = await fetch(`${prometheusUrl}/api/v1/query?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.status === 'success') {
        return data.data.result[0]?.value[1];
      } else {
        console.error('Error fetching metric:', data.error);
      }
    } catch (error) {
      console.error('Error fetching metric:', error);
    }

    return [];
  };

  const fetchOpenCostData = async (opencostUrl, queryParams) => {
    try {
      console.log(clusterInfo)
      console.log(`${opencostUrl}/allocation/compute?${queryParams}`)
      const response = await fetch(`${opencostUrl}/allocation/compute?${queryParams}`);
      const data = await response.json();

      if (data.status === 'success') {
        return data.data;
      } else {
        console.error('Error fetching OpenCost data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching OpenCost data:', error);
    }

    return {};
  };

  const fetchOpenCostMetrics = async () => {
    const queryParams = 'window=1d&resolution=1m&aggregate=namespace&accumulate=true';
    const openCostMetrics = await fetchOpenCostData(clusterInfo.opencostUrl, queryParams);
    console.log(openCostMetrics)
    if (Object.keys(openCostMetrics).length > 0) {
      setOpenCostData(openCostMetrics);

      // Extract container names from OpenCost data
      const containers = Object.keys(openCostMetrics[0]);
      setContainerList(containers);

    } else {
      console.error('OpenCost data is empty or invalid. Cannot proceed with fetching metrics.');
    }
  };

  

  useEffect(() => {
    if (containerList.length > 0) {
      fetchMetrics(containerList);
    }
  }, [containerList]);

  useEffect(() => {
    fetchOpenCostMetrics();
  }, []);

  const fetchMetrics = async (containerList) => {
    const fetchedMetrics = [];
    console.log(containerList)
    for (const container of containerList) {
      // CPU usage
      const cpuUsageMetric = await fetchPrometheusMetric(
        clusterInfo.prometheusUrl,
        `sum(rate(container_cpu_usage_seconds_total{namespace="${container}"}[1d]))/sum(machine_cpu_cores)*100`
      );

      // Memory usage
      const memoryUsageMetric = await fetchPrometheusMetric(
        clusterInfo.prometheusUrl,
        `sum(rate(container_memory_usage_bytes{namespace="${container}"}[1d]))`
      );

      // Network traffic (received and transmitted bytes)
      const networkRxBytesMetric = await fetchPrometheusMetric(
        clusterInfo.prometheusUrl,
        `sum(rate(container_network_receive_bytes_total{namespace="${container}"}[1d]))`
      );
      const networkTxBytesMetric = await fetchPrometheusMetric(
        clusterInfo.prometheusUrl,
        `sum(rate(container_network_transmit_bytes_total{namespace="${container}"}[1d]))`
      );

      // Disk usage
      const diskUsageMetric = await fetchPrometheusMetric(
        clusterInfo.prometheusUrl,
        `kubelet_volume_stats_capacity_bytes{namespace="${container}"} `
      );

      // Node resource allocation
      const nodeResourceAllocMetric = await fetchPrometheusMetric(
        clusterInfo.prometheusUrl,
        `kube_pod_container_resource_requests{namespace="${container}", resource="cpu"}`
      );

      console.log(openCostData[0]);

      const containerMetrics = {
        container,
        cpuUsage: cpuUsageMetric,
        memoryUsage: memoryUsageMetric,
        networkRxBytes: networkRxBytesMetric,
        networkTxBytes: networkTxBytesMetric,
        diskUsage: diskUsageMetric,
        cpuEfficiency: openCostData[0][container]?.cpuEfficiency,
        ramEfficiency: openCostData[0][container]?.ramEfficiency,
        totalEfficiency: openCostData[0][container]?.totalEfficiency,
        nodeResourceAlloc: nodeResourceAllocMetric,
        cpuCost: openCostData[0][container]?.cpuCost,
        ramCost: openCostData[0][container]?.ramCost,
        pvCost: openCostData[0][container]?.pvCost,
        totalCost: openCostData[0][container]?.totalCost,
      };

      fetchedMetrics.push(containerMetrics);
    }
    console.log(fetchedMetrics)
    setMetrics(fetchedMetrics);


  };

  useEffect(() => {
    console.log(index);
    const addGloablMetrics = [...globalMetrics]
    addGloablMetrics[index] = metrics
    onMetricsUpdate(addGloablMetrics)
    console.log(addGloablMetrics);
  }, [metrics]);

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const calculateColumnSums = () => {
    const sums = {
      cpuUsage: 0,
      memoryUsage: 0,
      networkRxBytes: 0,
      networkTxBytes: 0,
      diskUsage: 0,
      nodeResourceAlloc: 0,
      cpuCost: 0,
      ramCost: 0,
      pvCost: 0,
      totalCost: 0,
    };

    metrics.forEach((metric) => {
      Object.keys(sums).forEach((key) => {
        sums[key] += Number(metric[key] || 0);
      });
    });
    return sums;
  };

  const formatValue = (metricName, value) => {
    switch (metricName) {
      case 'cpuUsage':
        return `${Number(value).toFixed(2)}%`;
      case 'memoryUsage':
      case 'networkRxBytes':
      case 'networkTxBytes':
      case 'diskUsage':
        return formatBytes(value);
      case 'cpuCost':
      case 'ramCost':
      case 'pvCost':
      case 'totalCost':
        const rate = conversionRates[currency] || 1;
        const convertedValue = value * rate;
        return `${currency}${convertedValue.toFixed(2)}`;
      case 'nodeResourceAlloc':
      default:
        return value;
    }
  };

  return (
    <div className="cluster-table">
      <h2>{clusterInfo.clusterName}</h2>
      {metrics && openCostData ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Container</th>
              {metricColumns.map((column) => (
                <th key={column.name}>{column.displayName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.container}>
                <td>{metric.container}</td>
                {metricColumns.map((column) => (
                  <td key={column.name}>
                    {metric[column.name] === undefined
                      ? '-'
                      : formatValue(column.name, metric[column.name])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              {metricColumns.map((column, index) => {
                const sums = calculateColumnSums();
                return (
                  <td key={index}>
                    {column.name.endsWith('Efficiency')
                      ? '-'
                      : formatValue(column.name, sums[column.name] || 0)}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </Table>
      ) : (
        <p>Loading data...</p>
      )}
      <Button onClick={() => onRemove(clusterInfo.id)}>Remove</Button>
      <Button onClick={() => onEdit(clusterInfo.id)}>Edit</Button>
    </div>
  );
};

export default ClusterTable;
