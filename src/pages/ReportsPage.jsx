import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, ListGroup } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const reportData = [
  { date: '2026-02-11', volume: 125000000, transactions: 5430 },
  { date: '2026-02-12', volume: 145000000, transactions: 6120 },
  { date: '2026-02-13', volume: 165000000, transactions: 6890 },
  { date: '2026-02-14', volume: 172000000, transactions: 7200 },
  { date: '2026-02-15', volume: 188000000, transactions: 7850 },
  { date: '2026-02-16', volume: 198000000, transactions: 8340 },
  { date: '2026-02-17', volume: 210000000, transactions: 8920 }
];

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('daily');

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Reports & Analytics</h1>

      {/* Report Controls */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Report Type</Form.Label>
            <Form.Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="yearly">Yearly Report</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Date Range</Form.Label>
            <Form.Control type="date" />
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-end gap-2">
          <Button variant="primary">Generate</Button>
          <Button variant="outline-primary">📥 Download PDF</Button>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow">
            <Card.Body className="text-center">
              <h6 className="text-muted">Total Volume</h6>
              <h3 className="text-success">₸ 1.2T</h3>
              <small className="text-success">↑ 12% vs last period</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow">
            <Card.Body className="text-center">
              <h6 className="text-muted">Total Transactions</h6>
              <h3 className="text-info">52,749</h3>
              <small className="text-success">↑ 8% vs last period</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow">
            <Card.Body className="text-center">
              <h6 className="text-muted">Avg Transaction</h6>
              <h3>₸ 22.7M</h3>
              <small className="text-muted">→ 3% vs last period</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow">
            <Card.Body className="text-center">
              <h6 className="text-muted">Success Rate</h6>
              <h3 className="text-success">99.2%</h3>
              <small className="text-success">↑ 0.3% vs last period</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Transaction Volume Trend</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₸ ${(value / 1000000000).toFixed(1)}B`} />
                  <Line type="monotone" dataKey="volume" stroke="#28a745" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Top Categories</h6>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Shopping</span>
                <Badge bg="primary">28%</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Utilities</span>
                <Badge bg="info">22%</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Transfers</span>
                <Badge bg="success">25%</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Entertainment</span>
                <Badge bg="warning" text="dark">15%</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Other</span>
                <Badge bg="secondary">10%</Badge>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* Transaction Count */}
      <Row>
        <Col>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Daily Transactions</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="transactions" fill="#0066cc" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportsPage;
