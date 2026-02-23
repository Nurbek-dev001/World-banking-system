import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Badge, Modal } from 'react-bootstrap';

const DEPOSIT_PRODUCTS = [
  { id: 1, name: 'Standard Savings', rate: '4.5%', term: 'Flexible', minAmount: 10000 },
  { id: 2, name: 'Premium Savings', rate: '6.0%', term: '12 months', minAmount: 500000 },
  { id: 3, name: 'Gold Savings', rate: '7.5%', term: '24 months', minAmount: 1000000 },
  { id: 4, name: 'Elite Savings', rate: '8.5%', term: '36+ months', minAmount: 5000000 }
];

export const DepositsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    term: ''
  });

  const handleSelectDeposit = (deposit) => {
    setSelectedDeposit(deposit);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreate = () => {
    alert(`Deposit created for ${selectedDeposit.name}`);
    setShowModal(false);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Savings & Deposits</h1>

      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Available Deposit Products</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                {DEPOSIT_PRODUCTS.map((deposit) => (
                  <Col md={6} className="mb-3" key={deposit.id}>
                    <Card className="border">
                      <Card.Body>
                        <h6>{deposit.name}</h6>
                        <ListGroup variant="flush" className="my-3">
                          <ListGroup.Item className="ps-0 pe-0 border-0">
                            <strong>Interest Rate:</strong> <span className="text-success">{deposit.rate}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className="ps-0 pe-0 border-0">
                            <strong>Term:</strong> {deposit.term}
                          </ListGroup.Item>
                          <ListGroup.Item className="ps-0 pe-0 border-0">
                            <strong>Minimum:</strong> ₸ {deposit.minAmount.toLocaleString()}
                          </ListGroup.Item>
                        </ListGroup>
                        <Button 
                          variant="success" 
                          size="sm"
                          className="w-100"
                          onClick={() => handleSelectDeposit(deposit)}
                        >
                          Open Deposit
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Your Active Deposits</h6>
            </Card.Header>
            <ListGroup variant="flush">
              {[
                { id: 1, product: 'Premium Savings', amount: 500000, interest: 30000, maturityDate: '2026-02-17', rate: '6.0%' },
                { id: 2, product: 'Gold Savings', amount: 1000000, interest: 150000, maturityDate: '2027-02-17', rate: '7.5%' }
              ].map((activeDeposit) => (
                <ListGroup.Item key={activeDeposit.id}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-0">{activeDeposit.product}</h6>
                      <small className="text-muted">Matures: {activeDeposit.maturityDate}</small>
                    </div>
                    <Badge bg="info">{activeDeposit.rate}</Badge>
                  </div>
                  <Row>
                    <Col>
                      <small className="text-muted">Principal Amount</small>
                      <p className="mb-0">₸ {activeDeposit.amount.toLocaleString()}</p>
                    </Col>
                    <Col>
                      <small className="text-muted">Earned Interest</small>
                      <p className="mb-0 text-success fw-bold">₸ {activeDeposit.interest.toLocaleString()}</p>
                    </Col>
                  </Row>
                  <Button variant="outline-primary" size="sm" className="mt-2">Renew Deposit</Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">📊 Interest Calculator</h6>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Deposit Amount</Form.Label>
                <Form.Control type="number" placeholder="0 ₸" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Deposit Term</Form.Label>
                <Form.Select>
                  <option>Select term</option>
                  <option>3 months</option>
                  <option>6 months</option>
                  <option>12 months</option>
                  <option>24 months</option>
                  <option>36 months</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Interest Rate</Form.Label>
                <Form.Control type="text" placeholder="6.0%" disabled value="6.0%" />
              </Form.Group>

              <Card className="bg-light">
                <Card.Body>
                  <small className="text-muted">Total Interest</small>
                  <h5 className="text-success">₸ 300,000</h5>
                  <small className="text-muted">Final Amount</small>
                  <p className="mb-0">₸ 1,300,000</p>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>

          <Card className="shadow mt-3 bg-success text-white">
            <Card.Body>
              <h6>💡 World Gold Bonus</h6>
              <p className="mb-0 small">Get 0.5% extra interest on deposits above 1M ₸</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Deposit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Open {selectedDeposit?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Deposit Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleChange}
              />
              <small className="text-muted">Minimum: ₸ {selectedDeposit?.minAmount.toLocaleString()}</small>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Deposit Term</Form.Label>
              <Form.Select
                name="term"
                value={formData.term}
                onChange={handleChange}
              >
                <option value="">Select term</option>
                <option>1 month</option>
                <option>3 months</option>
                <option>6 months</option>
                <option>12 months</option>
              </Form.Select>
            </Form.Group>

            <Card className="bg-light mb-3">
              <Card.Body>
                <small>Estimated Interest (yearly)</small>
                <h6 className="text-success">₸ 30,000</h6>
              </Card.Body>
            </Card>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleCreate}>Create Deposit</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DepositsPage;
