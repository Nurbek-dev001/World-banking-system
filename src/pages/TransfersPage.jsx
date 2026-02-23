import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Tab, Tabs, InputGroup } from 'react-bootstrap';

export const TransfersPage = () => {
  const [transferType, setTransferType] = useState('phone');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    recipient: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Transfer:', formData);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Send Money</h1>

      <Row>
        <Col lg={8}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <Tabs activeKey={transferType} onSelect={(k) => setTransferType(k)} className="mb-4">
                <Tab eventKey="phone" title="📱 By Phone Number">
                  <Form onSubmit={handleSubmit} className="mt-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Recipient Phone</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>+7</InputGroup.Text>
                        <Form.Control
                          type="tel"
                          name="recipient"
                          placeholder="(XXX) XXX-XXXX"
                          value={formData.recipient}
                          onChange={handleChange}
                          required
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Amount</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          name="amount"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={handleChange}
                          required
                        />
                        <InputGroup.Text>₸</InputGroup.Text>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        placeholder="Add a note..."
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Button variant="success" type="submit" size="lg" className="w-100">
                      Send Money
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="card" title="💳 By Card Number">
                  <Form onSubmit={handleSubmit} className="mt-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Card Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="recipient"
                        placeholder="XXXX XXXX XXXX XXXX"
                        value={formData.recipient}
                        onChange={handleChange}
                        maxLength="19"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Amount</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          name="amount"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={handleChange}
                          required
                        />
                        <InputGroup.Text>₸</InputGroup.Text>
                      </InputGroup>
                    </Form.Group>

                    <Button variant="success" type="submit" size="lg" className="w-100">
                      Send Money
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="account" title="🏦 To Own Account">
                  <Form onSubmit={handleSubmit} className="mt-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Target Account</Form.Label>
                      <Form.Select name="recipient" onChange={handleChange} required>
                        <option value="">Select account</option>
                        <option value="savings">Savings Account</option>
                        <option value="business">Business Account</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Amount</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          name="amount"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={handleChange}
                          required
                        />
                        <InputGroup.Text>₸</InputGroup.Text>
                      </InputGroup>
                    </Form.Group>

                    <Button variant="success" type="submit" size="lg" className="w-100">
                      Transfer
                    </Button>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">📋 Saved Recipients</h6>
            </Card.Header>
            <ListGroup variant="flush">
              {[
                { name: 'John Doe', phone: '+77123456789' },
                { name: 'Jane Smith', phone: '+77987654321' },
                { name: 'Mom', phone: '+77555555555' }
              ].map((recipient, i) => (
                <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">{recipient.name}</h6>
                    <small className="text-muted">{recipient.phone}</small>
                  </div>
                  <Button variant="outline-primary" size="sm">Send</Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TransfersPage;
