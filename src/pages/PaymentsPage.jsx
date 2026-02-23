import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge, Alert } from 'react-bootstrap';
import { paymentService } from '../services/api.js';

const PAYMENT_CATEGORIES = [
  { id: 'utilities', name: '⚡ Utilities', description: 'Electricity, Water, Gas' },
  { id: 'internet', name: '📡 Internet & Mobile', description: 'Beeline, Kcell, Tele2' },
  { id: 'education', name: '📚 Education', description: 'School, University' },
  { id: 'government', name: '🏛️ Government', description: 'Taxes, Fines, Permits' },
  { id: 'shopping', name: '🛍️ Shopping', description: 'Online & Retail' },
  { id: 'other', name: '📌 Other', description: 'Parking, Services' }
];

export const PaymentsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('utilities');
  const [formData, setFormData] = useState({
    accountNumber: '',
    amount: '',
    reference: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form data
      if (!formData.accountNumber || !formData.amount) {
        throw new Error('Please fill in all required fields');
      }

      // Call payment API
      const response = await paymentService.createPayment({
        category: selectedCategory,
        accountNumber: formData.accountNumber,
        amount: parseFloat(formData.amount),
        reference: formData.reference
      });

      setSuccess(`Payment of ₸${formData.amount} processed successfully!`);
      // Reset form
      setFormData({ accountNumber: '', amount: '', reference: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Pay Bills & Services</h1>

      <Row>
        <Col lg={8}>
          <Card className="shadow mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Select Category</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                {PAYMENT_CATEGORIES.map((cat) => (
                  <Col sm={6} className="mb-3" key={cat.id}>
                    <div
                      className={`p-3 border rounded cursor-pointer ${
                        selectedCategory === cat.id ? 'border-success bg-light' : ''
                      }`}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <h6 className="mb-1">{cat.name}</h6>
                      <small className="text-muted">{cat.description}</small>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow">
            <Card.Body className="p-4">
              <h5 className="mb-4">Payment Details</h5>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Account/Reference Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="accountNumber"
                    placeholder="Enter account number"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="number"
                      name="amount"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <span className="input-group-text">₸</span>
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Description/Reference</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="reference"
                    placeholder="Add reference..."
                    value={formData.reference}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Form.Group>

                <Button 
                  variant="success" 
                  type="submit" 
                  size="lg" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Pay Now'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">💳 Payment Methods</h6>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <span>Debit Card</span>
                <Badge bg="success">Selected</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <span>Account Balance</span>
                <Badge bg="secondary">450,320 ₸</Badge>
              </ListGroup.Item>
            </ListGroup>
          </Card>

          <Card className="shadow mt-3">
            <Card.Header className="bg-light">
              <h6 className="mb-0">📜 Recent Payments</h6>
            </Card.Header>
            <ListGroup variant="flush">
              {[
                { name: 'Electricity Bill', amount: 8500, date: 'Today' },
                { name: 'Internet Bill', amount: 5000, date: 'Feb 10' },
                { name: 'School Fee', amount: 100000, date: 'Feb 5' }
              ].map((payment, i) => (
                <ListGroup.Item key={i}>
                  <div className="d-flex justify-content-between">
                    <span>{payment.name}</span>
                    <strong>-₸ {payment.amount.toLocaleString()}</strong>
                  </div>
                  <small className="text-muted">{payment.date}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentsPage;
