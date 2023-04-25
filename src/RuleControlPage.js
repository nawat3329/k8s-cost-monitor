// RuleControlPage.js
import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import Table from 'react-bootstrap/Table';



const RuleControlPage = ({ clusters = [], metricsData }) => {
  const [selectedClusterIndex, setSelectedClusterIndex] = useState(null);
  const [namespaces, setNamespaces] = useState([]);
  const [selectedNamespace, setselectedNamespace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deployments, setDeployments] = useState([]);
  const [selectedDeployment, setSelectedDeployments] = useState(null);



  const [rule, setRule] = useState({
    costType: 'totalCost',
    comparison: '>',
    costThreshold: '',
    action: 'change_replica',
    replicaCount: 1,
  });

  const loadRules = () => {
    const savedRules = localStorage.getItem('rules');
    return savedRules ? JSON.parse(savedRules) : [];
  };

  const [rules, setRules] = useState(loadRules());

  const deleteRule = (index) => {
    const newRules = rules.filter((_, idx) => idx !== index);
    setRules(newRules);
    localStorage.setItem('rules', JSON.stringify(newRules));
  };


  const handleInputChange = (event, field) => {
    console.log(selectedClusterIndex)
    setRule({
      ...rule,
      [field]: event.target.value,
    });
  };

  const handleSubmit = () => {
    const newRule = {
      ...rule,
      cluster: selectedClusterIndex,
      namespace: selectedNamespace,
      resourceName: selectedDeployment,
    };

    setRule(newRule);
    console.log('Rule submitted:', newRule);
    // Save rule to localStorage
    const savedRules = localStorage.getItem('rules');
    const rules = savedRules ? JSON.parse(savedRules) : [];
    rules.push(newRule);
    localStorage.setItem('rules', JSON.stringify(rules));
    setRules(rules);
  };



  const applyRule = async (rule) => {
    const { cluster, namespace, resourceName, costType, comparison, costThreshold, replicaCount } = rule;

    // Find the relevant cost value based on the costType
    const costValue = metricsData[cluster]?.find((metric) => metric.container === namespace)?.[costType];
    console.log(metricsData[cluster]);
    if (costValue === undefined) {
      console.error('Cost value not found for the given rule:', rule);
      return;
    }

    // Check if the rule should be applied based on the comparison
    let shouldApplyRule = false;
    switch (comparison) {
      case '>':
        shouldApplyRule = costValue > parseFloat(costThreshold);
        break;
      case '<':
        shouldApplyRule = costValue < parseFloat(costThreshold);
        break;
      case '>=':
        shouldApplyRule = costValue >= parseFloat(costThreshold);
        break;
      case '<=':
        shouldApplyRule = costValue <= parseFloat(costThreshold);
        break;
      case '=':
        shouldApplyRule = costValue === parseFloat(costThreshold);
        break;
      default:
        console.error('Invalid comparison in rule:', rule);
        return;
    }

    // Apply the rule if the condition is met
    if (shouldApplyRule) {
      console.log('Applying rule:', rule);
      console.log(selectedClusterIndex);
      console.log("test",clusters[selectedClusterIndex]);


      // Configure the axios request
      const config = {
        method: 'patch',
        url: `${clusters[cluster].kubernetesApiUrl}/apis/apps/v1/namespaces/${namespace}/deployments/${resourceName}`,
        headers: {
          'Content-Type': 'application/strategic-merge-patch+json'
        },
        data: {
          "spec": {
            "replicas": Number(replicaCount),
          },
        },
      };
      try {
        const response = await axios(config);
        console.log('Successfully applied rule:', response.data);
      } catch (error) {
        console.error('Error applying rule:', error);
      }
    } else {
      console.log('Rule condition not met:', rule);
    }


  };


  // useEffect(() => {
  //   const savedRules = localStorage.getItem('rules');
  //   const rules = savedRules ? JSON.parse(savedRules) : [];

  //   const intervalId = setInterval(() => {
  //     rules.forEach((rule) => applyRule(rule));
  //   }, 600000); // 10 minutes

  //   // Clean up the interval when the component is unmounted
  //   return () => clearInterval(intervalId);
  // }, []);

  useEffect(() => {
    console.log('metricsData', metricsData);
    console.log('clusters', clusters);
    if (metricsData.length > 0) {
      setLoading(false);
    }
  }, [metricsData]);

  useEffect(() => {
    if (selectedClusterIndex !== null) {
      const namespacesList = metricsData[selectedClusterIndex].map((metric) => metric.container);
      setNamespaces(namespacesList);
    }
  }, [selectedClusterIndex, metricsData]);

  const handleApplyAllRules = () => {
    // Iterate through the rules and apply each one
    rules.forEach((rule) => {
      applyRule(rule);
    });
  };

  useEffect(() => {
    if (selectedClusterIndex !== null) {
      const fetchDeployments = async () => {
        try {
          console.log(`${clusters[selectedClusterIndex].kubernetesApiUrl}/apis/apps/v1/namespaces/${selectedNamespace}/deployments`);
          const response = await axios.get(`${clusters[selectedClusterIndex].kubernetesApiUrl}/apis/apps/v1/namespaces/${selectedNamespace}/deployments`);
          const deploymentList = response.data.items.map((deployment) => deployment.metadata.name);
          setDeployments(deploymentList);
          console.log('deploymentList', deploymentList);
        } catch (error) {
          console.error('Error fetching deployments:', error);
        }
      };

      fetchDeployments();
    }
  }, [selectedNamespace]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="m-4">
          <h1>Rule-based Control</h1>

          <Form>
            <Form.Group controlId="costType">
              <Form.Label>Cost Type</Form.Label>
              <Form.Control as="select" value={rule.costType} onChange={(e) => handleInputChange(e, 'costType')}>
                <option value="totalCost">Total Cost</option>
                <option value="cpuCost">CPU Cost</option>
                <option value="ramCost">RAM Cost</option>
                <option value="pvCost">PV Cost</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="comparison">
              <Form.Label>Comparison</Form.Label>
              <Form.Control as="select" value={rule.comparison} onChange={(e) => handleInputChange(e, 'comparison')}>
                <option value="<">&lt;</option>
                <option value=">">&gt;</option>
                <option value="<=">&lt;=</option>
                <option value=">=">&gt;=</option>
                <option value="==">==</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="costThreshold">
              <Form.Label>Cost threshold</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter cost threshold"
                value={rule.costThreshold}
                onChange={(e) => handleInputChange(e, 'costThreshold')}
              />
            </Form.Group>

            <Form.Group controlId="action">
              <Form.Label>Action</Form.Label>
              <Form.Control as="select" value={rule.action} onChange={(e) => handleInputChange(e, 'action')}>
                <option value="change_replica">change replica count</option>
                {/* Add more actions if needed */}
              </Form.Control>
            </Form.Group>

            {rule.action === 'change_replica' && (
              <Form.Group controlId="replicaCount">
                <Form.Label>Replica count</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter replica count"
                  value={rule.replicaCount}
                  onChange={(e) => handleInputChange(e, 'replicaCount')}
                />
              </Form.Group>
            )}
            {/* Cluster dropdown */}
            <Form.Group controlId="cluster">
              <Form.Label>Select Cluster</Form.Label>
              <Form.Control
                as="select"
                value={selectedClusterIndex}
                onChange={(e) => setSelectedClusterIndex(e.target.value)}
              >
                <option value="">Choose a cluster...</option>
                {metricsData.map((_, index) => (
                  <option key={index} value={index}>
                    {`Cluster ${clusters[index].clusterName}`}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Namespace dropdown */}
            <Form.Group controlId="namespace">
              <Form.Label>Select Namespace</Form.Label>
              <Form.Control
                as="select"
                disabled={selectedClusterIndex === null
                }
                onChange={(e) => setselectedNamespace(e.target.value)}>
                <option value="">Choose a namespace...</option>
                {namespaces.map((namespace, index) => (
                  <option key={index} value={namespace}>
                    {namespace}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            {/* Resource name dropdown */}
            <Form.Group controlId="resourceName">
              <Form.Label>Select Resource Name</Form.Label>
              <Form.Control as="select" disabled={selectedClusterIndex === null}
                onChange={(e) => setSelectedDeployments(e.target.value)}>
                <option value="">Choose a resource name...</option>
                {deployments.map((deployment, index) => (
                  <option key={index} value={deployment}>
                    {deployment}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" className="m-4" onClick={handleSubmit}>
              Save Rule
            </Button>
          </Form>
          <Table striped bordered hover className="m-4"> 
            <thead>
              <tr>
                <th>Cost Type</th>
                <th>Comparison</th>
                <th>Cost Threshold</th>
                <th>Action</th>
                <th>Replica Count</th>
                <th>Cluster</th>
                <th>Namespace</th>
                <th>Resource Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, index) => (
                <tr key={index}>
                  <td>{rule.costType}</td>
                  <td>{rule.comparison}</td>
                  <td>{rule.costThreshold}</td>
                  <td>{rule.action}</td>
                  <td>{rule.replicaCount}</td>
                  <td>{rule.cluster}</td>
                  <td>{rule.namespace}</td>
                  <td>{rule.resourceName}</td>
                  <td>
                    <Button variant="danger" onClick={() => deleteRule(index)}>
                      Delete
                    </Button>{' '}
                    <Button variant="primary" onClick={() => applyRule(rule)}>
                      Apply Rule
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button className="m-4" onClick={handleApplyAllRules}>Apply All Rules</Button>

        </div>

      )}
    </div>
  );
};

export default RuleControlPage;
