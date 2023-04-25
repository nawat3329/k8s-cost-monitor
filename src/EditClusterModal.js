// EditClusterModal.js
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const EditClusterModal = ({ isOpen, onRequestClose, clusterInfo, onUpdateCluster, loading }) => {
  const [editedClusterInfo, setEditedClusterInfo] = useState(clusterInfo);

  useEffect(() => {
    if (!loading) {
      setEditedClusterInfo(clusterInfo);
    }
  }, [clusterInfo, loading]);

  const handleSubmit = () => {
    console.log('clusterInfo', clusterInfo);
    console.log('editedClusterInfo', editedClusterInfo);
    onUpdateCluster(editedClusterInfo);
    onRequestClose();
  };

  const handleInputChange = (event, field) => {
    setEditedClusterInfo({
      ...editedClusterInfo,
      [field]: event.target.value,
    });
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2>Edit cluster</h2>
      {editedClusterInfo ? (
        <Form>
          <Form.Group controlId="clusterName">
            <Form.Label>Cluster Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Cluster Name"
              value={editedClusterInfo.clusterName}
              onChange={(e) => setEditedClusterInfo({ ...editedClusterInfo, clusterName: e.target.value })}
            />
          </Form.Group>

          <Form.Group controlId="cloudProvider">
            <Form.Label>Cloud Provider</Form.Label>
            <Form.Control
              as="select"
              value={editedClusterInfo.cloudProvider}
              onChange={(e) => setEditedClusterInfo({ ...editedClusterInfo, cloudProvider: e.target.value })}
            >
              <option value="">Select Cloud Provider</option>
              <option value="AKS">AKS (Azure)</option>
              <option value="GKE">GKE (Google Cloud Platform)</option>
              <option value="EKS">EKS (Amazon Web Services)</option>
              {/* Add more cloud providers if needed */}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="prometheusUrl">
            <Form.Label>Prometheus URL</Form.Label>
            <Form.Control
              type="url"
              placeholder="Enter Prometheus URL"
              value={editedClusterInfo.prometheusUrl}
              onChange={(e) => setEditedClusterInfo({ ...editedClusterInfo, prometheusUrl: e.target.value })}
            />
          </Form.Group>

          <Form.Group controlId="opencostUrl">
            <Form.Label>OpenCost URL</Form.Label>
            <Form.Control
              type="url"
              placeholder="Enter OpenCost URL"
              value={editedClusterInfo.opencostUrl}
              onChange={(e) => setEditedClusterInfo({ ...editedClusterInfo, opencostUrl: e.target.value })}
            />
          </Form.Group>

          <Form.Group controlId="kubernetesApiUrl">
            <Form.Label>Kubernetes API URL</Form.Label>
            <Form.Control
              type="url"
              placeholder="Enter Kubernetes API URL"
              value={editedClusterInfo.kubernetesApiUrl}
              onChange={(e) => setEditedClusterInfo({ ...editedClusterInfo, kubernetesApiUrl: e.target.value })}
            />
          </Form.Group>

          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Form>
      ) : (
        <p>Loading...</p>
      )}
    </Modal>
  );
};

export default EditClusterModal;
