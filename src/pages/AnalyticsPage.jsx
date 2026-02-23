import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, ListGroup, Badge } from 'react-bootstrap';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const spendingByCategory = [
  { name: 'Shopping', value: 120000, color: '#0088FE' },
  { name: 'Food', value: 85000, color: '#00C49F' },
  { name: 'Transport', value: 45000, color: '#FFBB28' },
  { name: 'Utilities', value: 32000, color: '#FF8042' },
  { name: 'Other', value: 28000, color: '#8884D8' }
];

const monthlyData = [
  { month: 'Jan', income: 150000, spending: 45000, savings: 105000 },
  { month: 'Feb', income: 150000, spending: 52000, savings: 98000 },
  { month: 'Mar', income: 150000, spending: 48000, savings: 102000 },
  { month: 'Apr', income: 150000, spending: 61000, savings: 89000 },
  { month: 'May', income: 150000, spending: 55000, savings: 95000 },
  { month: 'Jun', income: 150000, spending: 67000, savings: 83000 }
];

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const totalSpending = spendingByCategory.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <Container className="py-4">
      <h1 className="mb-4">Financial Analytics</h1>

      <Row className="mb-4">
        <Col>
          <Form.Select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-auto"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow text-center">
            <Card.Body>
              <h6 className="text-muted">Total Income</h6>
              <h3 className="text-success">₸ 900,000</h3>
              <small className="text-muted">Last 6 months</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow text-center">
            <Card.Body>
              <h6 className="text-muted">Total Spending</h6>
              <h3 className="text-danger">₸ {totalSpending.toLocaleString()}</h3>
              <small className="text-muted">Last 6 months</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow text-center">
            <Card.Body>
              <h6 className="text-muted">Total Saved</h6>
              <h3 className="text-info">₸ 572,000</h3>
              <small className="text-muted">Last 6 months</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow text-center">
            <Card.Body>
              <h6 className="text-muted">Savings Rate</h6>
              <h3>63.6%</h3>
              <small className="text-muted">Of income saved</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Income vs Spending Trend</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₸ ${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#28a745" strokeWidth={2} />
                  <Line type="monotone" dataKey="spending" stroke="#dc3545" strokeWidth={2} />
                  <Line type="monotone" dataKey="savings" stroke="#0066cc" strokeWidth={2} />
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
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={spendingByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ₸${value.toLocaleString()}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {spendingByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₸ ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Monthly Breakdown */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Monthly Spending Trend</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₸ ${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="spending" fill="#dc3545" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Top Spending Categories</h6>
            </Card.Header>
            <ListGroup variant="flush">
              {spendingByCategory.map((cat, i) => (
                <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">{cat.name}</h6>
                    <small className="text-muted">
                      {((cat.value / totalSpending) * 100).toFixed(1)}% of spending
                    </small>
                  </div>
                  <div className="text-end">
                    <strong>₸ {cat.value.toLocaleString()}</strong>
                    <div 
                      style={{
                        width: '50px',
                        height: '8px',
                        backgroundColor: cat.color,
                        marginTop: '4px',
                        borderRadius: '4px'
                      }}
                    ></div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* Insights */}
      <Card className="shadow">
        <Card.Header className="bg-light">
          <h6 className="mb-0">📊 Insights & Recommendations</h6>
        </Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <h6 className="mb-1">💡 Spending Alert</h6>
            <p className="mb-0 text-muted">Your spending in June increased by 22% compared to May. Consider reviewing your purchases.</p>
          </ListGroup.Item>
          <ListGroup.Item>
            <h6 className="mb-1">✅ Savings Goal</h6>
            <p className="mb-0 text-muted">You're on track to save ₸600,000 this year! Keep up the good work.</p>
          </ListGroup.Item>
          <ListGroup.Item>
            <h6 className="mb-1">🎯 Investment Opportunity</h6>
            <p className="mb-0 text-muted">Your savings rate is excellent. Consider opening a high-yield deposit account.</p>
          </ListGroup.Item>
        </ListGroup>
      </Card>
    </Container>
  );
};

export default AnalyticsPage;
