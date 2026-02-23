import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
  { month: 'Jan', spending: 45000, income: 150000 },
  { month: 'Feb', spending: 52000, income: 150000 },
  { month: 'Mar', spending: 48000, income: 150000 },
  { month: 'Apr', spending: 61000, income: 150000 },
  { month: 'May', spending: 55000, income: 150000 },
  { month: 'Jun', spending: 67000, income: 150000 }
];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [balance] = useState(450320.50);

  return (
    <Container className="py-4">
      <h1 className="mb-4">Dashboard</h1>

      <Row className="mb-4">
        <Col lg={4}>
          <Card className="bg-success text-white shadow">
            <Card.Body>
              <h6 className="text-uppercase mb-2">Balance</h6>
              <h2>₸ {balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</h2>
              <small className="text-light">World Gold Account</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="bg-info text-white shadow">
            <Card.Body>
              <h6 className="text-uppercase mb-2">This Month Spending</h6>
              <h2>₸ 67,000</h2>
              <small className="text-light">6 transactions</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="bg-warning text-white shadow">
            <Card.Body>
              <h6 className="text-uppercase mb-2">Cashback</h6>
              <h2>₸ 1,350</h2>
              <small className="text-light">Available to use</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h5 className="mb-3">Quick Actions</h5>
          <div className="d-flex gap-2 flex-wrap">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => navigate('/transfers')}
            >
              💸 Send Money
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => navigate('/payments')}
            >
              💳 Pay Bills
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => navigate('/marketplace')}
            >
              🛒 Shop
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => alert('Send request to contact')}
            >
              💰 Request Money
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => navigate('/loans')}
            >
              🏦 Get Loan
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Income vs Spending</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₸ ${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#28a745" />
                  <Line type="monotone" dataKey="spending" stroke="#dc3545" />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Spending by Category</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₸ ${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="spending" fill="#ffc107" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Recent Transactions</h6>
            </Card.Header>
            <ListGroup variant="flush">
              {[
                { type: 'Payment', desc: 'Electricity Bill', amount: -8500, date: 'Today' },
                { type: 'Transfer', desc: 'John Doe', amount: -50000, date: 'Yesterday' },
                { type: 'Salary', desc: 'Monthly Income', amount: 150000, date: '2 days ago' },
                { type: 'Shopping', desc: 'Online Store', amount: -25000, date: '3 days ago' }
              ].map((tx, i) => (
                <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">{tx.desc}</h6>
                    <small className="text-muted">{tx.type} • {tx.date}</small>
                  </div>
                  <span className={tx.amount > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                    {tx.amount > 0 ? '+' : ''} ₸ {Math.abs(tx.amount).toLocaleString()}
                  </span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">🎁 Offers</h6>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">5% Cashback</h6>
                    <small className="text-muted">Shopping Category</small>
                  </div>
                  <Badge bg="success">NEW</Badge>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <div>
                  <h6 className="mb-1">Free Transfer</h6>
                  <small className="text-muted">First 10 transfers</small>
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <Button variant="info" size="sm" className="w-100">View All Offers</Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
