This project is for CSS451:Cloud Computing class
# Kubernetes Cost Management and Resource Optimization Dashboard

This application provides an efficient and flexible solution for cost management and resource optimization in Kubernetes clusters. It integrates with the Kubernetes API, Prometheus, and OpenCost to offer a comprehensive view of resource usage and cost. The application allows you to create customizable cost control strategies and simplifies the management process across different Kubernetes providers.

## Requirements

- A Kubernetes cluster
- Prometheus installed on the cluster
- OpenCost installed on the cluster
- Port forwarding set up for the Kubernetes API, Prometheus, and OpenCost

## Installation

Follow these steps to install and run the application:

1. Clone this repository.

2. Navigate to the project directory.

3. Install the necessary dependencies using `npm install`.

4. Start the application using `npm start`.

The application should now be running on your local machine. Open your web browser and navigate to `http://localhost:3000` to access the dashboard.

## Adding a Cluster to the Dashboard

1. Ensure that you have set up port forwarding for the Kubernetes API, Prometheus, and OpenCost.

2. On the dashboard, click the "Add Cluster" button.

3. Enter the forwarded port addresses for the Kubernetes API, Prometheus, and OpenCost in the corresponding input fields.

4. Click "Submit" to add the cluster to the dashboard.

The dashboard should now display information about the added cluster, including resource usage and cost data.

