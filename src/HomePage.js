import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import ClusterTable from './ClusterTable';
import AddClusterModal from './AddClusterModal';
import EditClusterModal from './EditClusterModal';
import "./styles.css";

const HomePage = ({ selectedCurrency, conversionRates, setMetrics, metrics, clusters, setClusters }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClusterIndex, setSelectedClusterIndex] = useState(null);
  const [loading, setLoading] = useState(true);


  const handleAddCluster = (clusterInfo) => {
    const newClusters = [...clusters, clusterInfo];
    setClusters(newClusters);
    // Save cluster information to localStorage
    localStorage.setItem('clusters', JSON.stringify(newClusters));
  };


  const handleRemoveCluster = (index) => {
    const newClusters = clusters.filter((_, idx) => idx !== index);
    setClusters(newClusters);
    // Update localStorage
    localStorage.setItem('clusters', JSON.stringify(newClusters));
  };

  const handleEditCluster = (updatedClusterInfo) => {
    console.log(updatedClusterInfo);
    const newClusters = clusters.map((cluster, index) =>
      index === selectedClusterIndex ? updatedClusterInfo : cluster
    );
    setClusters(newClusters);
    // Update localStorage
    localStorage.setItem('clusters', JSON.stringify(newClusters));
  };

  useEffect(() => {
    // Load saved cluster data from localStorage
    const savedClusters = localStorage.getItem('clusters');
    if (savedClusters) {
      setClusters(JSON.parse(savedClusters));
    }
    setLoading(false);
  }, []);


  return (
    <div className='container'>
      <h1 style={{ padding: '20px' }}> Cluster Monitoring Dashboard</h1>
      <Button onClick={() => setIsModalOpen(true)}>Add new cluster</Button>

      {clusters.map((cluster, index) => (
        <div className="table-container">
          <ClusterTable
            key={index}
            index={index}
            clusterInfo={cluster}
            currency={selectedCurrency}
            conversionRates={conversionRates}
            onRemove={() => handleRemoveCluster(index)}
            onEdit={() => {
              setSelectedClusterIndex(index);
              setIsEditModalOpen(true);
            }}
            onMetricsUpdate={setMetrics}
            globalMetrics={metrics}
          />
        </div>
      ))}
      <AddClusterModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onAddCluster={handleAddCluster}
      />
      {console.log(clusters)}
      <EditClusterModal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        clusterInfo={clusters[selectedClusterIndex]}
        onUpdateCluster={handleEditCluster}
        loading={loading}
      />
    </div>
  );
}

export default HomePage;
