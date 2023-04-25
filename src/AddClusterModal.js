// AddClusterModal.js
import React, { useState } from 'react';
import Modal from 'react-modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const AddClusterModal = ({ isOpen, onRequestClose, onAddCluster }) => {
  const [clusterName, setClusterName] = useState('');
  const [prometheusUrl, setPrometheusUrl] = useState('');
  const [opencostUrl, setOpencostUrl] = useState('');
  const [cloudProvider, setCloudProvider] = useState('');
  const [kubernetesApiUrl, setKubernetesApiUrl] = useState('');

  const handleSubmit = () => {
    onAddCluster({ clusterName, prometheusUrl, opencostUrl, cloudProvider, kubernetesApiUrl });
    onRequestClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2>Add new cluster</h2>
      <div className="table-container">
      <Form.Group controlId="clusterName">
          <Form.Label>Cluster Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Cluster Name"
            value={clusterName}
            onChange={(e) => setClusterName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="cloudProvider">
          <Form.Label>Cloud Provider</Form.Label>
          <Form.Control as="select" value={cloudProvider} onChange={(e) => setCloudProvider(e.target.value)}>
            <option value="">Select Cloud Provider</option>
            <option value="AKS">AKS (Azure)</option>
            <option value="GKE">GKE (Google Cloud Platform)</option>
            <option value="EKS">EKS (Amazon Web Services)</option>
            {/* Add more cloud providers if needed */}
          </Form.Control>
        </Form.Group>
      <Form>
        <Form.Group controlId="prometheusUrl">
          <Form.Label>Prometheus URL</Form.Label>
          <Form.Control
            type="url"
            placeholder="Enter Prometheus URL"
            value={prometheusUrl}
            onChange={(e) => setPrometheusUrl(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="opencostUrl">
          <Form.Label>OpenCost URL</Form.Label>
          <Form.Control
            type="url"
            placeholder="Enter OpenCost URL"
            value={opencostUrl}
            onChange={(e) => setOpencostUrl(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="kubernetesApiUrl">
          <Form.Label>Kubernetes API URL</Form.Label>
          <Form.Control
            type="url"
            placeholder="Enter Kubernetes API URL"
            value={kubernetesApiUrl}
            onChange={(e) => setKubernetesApiUrl(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" onClick={handleSubmit}>
          Confirm
        </Button>
      </Form>
      </div>
    </Modal>
  );
};

export default AddClusterModal;
