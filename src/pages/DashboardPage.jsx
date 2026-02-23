import React from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { date: '2026-02-11', users: 1250, transactions: 5430, volume: 125000000 },
  { date: '2026-02-12', users: 1340, transactions: 6120, volume: 145000000 },
  { date: '2026-02-13', users: 1420, transactions: 6890, volume: 165000000 },
  { date: '2026-02-14', users: 1510, transactions: 7200, volume: 172000000 },
  { date: '2026-02-15', users: 1680, transactions: 7850, volume: 188000000 },
  { date: '2026-02-16', users: 1825, transactions: 8340, volume: 198000000 },
  { date: '2026-02-17', users: 1950, transactions: 8920, volume: 210000000 }
];

export const DashboardPage = () => {
  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Admin Dashboard</h1>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow">
            <Card.Body className="text-center">
              <h6 className="text-muted">Total Users</h6>
              <h2 className="text-primary">1,950</h2>
              <small className="text-success">↑ 12% this week</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow">
            <Card.Body className="text-center">
              <h6 className="text-muted">Total Transactions</h6>
              <h2 className="text-info">8,920</h2>
              <small className="text-success">↑ 8% this week</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow">
            <Card.Body className="text-center">
              <h6 className="text-muted">Transaction Volume</h6>
              <h2 className="text-success">₸ 210B</h2>
              <small className="text-success">↑ 15% this week</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow">
            <Card.Body className="text-center">
              <h6 className="text-muted">Active Sessions</h6>
              <h2 className="text-warning">342</h2>
              <small className="text-muted">Right now</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Users Growth Trend</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#0066cc" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">System Status</h6>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between">
                <span>API Server</span>
                <Badge bg="success">Online</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Database</span>
                <Badge bg="success">Online</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Cache</span>
                <Badge bg="success">Online</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Email Service</span>
                <Badge bg="success">Online</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>SMS Service</span>
                <Badge bg="warning">Degraded</Badge>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* Transaction Volume Chart */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Transaction Volume Trend</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₸ ${(value / 1000000000).toFixed(0)}B`} />
                  <Bar dataKey="volume" fill="#28a745" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row>
        <Col>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Recent System Activities</h6>
            </Card.Header>
            <ListGroup variant="flush">
              {[
                { time: '2 minutes ago', event: 'User registration', user: 'admin@world.kz', status: 'success' },
                { time: '5 minutes ago', event: 'Large transaction', user: 'transaction #12345', status: 'success' },
                { time: '12 minutes ago', event: 'User verification', user: 'user@example.com', status: 'pending' },
                { time: '25 minutes ago', event: 'Account locked', user: 'user@blocked.com', status: 'warning' },
                { time: '1 hour ago', event: 'System backup', user: 'System', status: 'success' }
              ].map((activity, i) => (
                <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">{activity.event}</h6>
                    <small className="text-muted">{activity.user} • {activity.time}</small>
                  </div>
                  <Badge 
                    bg={
                      activity.status === 'success' ? 'success' :
                      activity.status === 'warning' ? 'warning' : 'info'
                    }
                  >
                    {activity.status}
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
