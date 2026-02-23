import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Badge, ProgressBar, Modal } from 'react-bootstrap';

const LOAN_PRODUCTS = [
  { id: 1, name: 'Personal Loan', rate: '8.5% APR', term: '1-5 years', amount: 'Up to 5M ₸' },
  { id: 2, name: 'Auto Loan', rate: '7.2% APR', term: '1-7 years', amount: 'Up to 15M ₸' },
  { id: 3, name: 'Home Loan', rate: '6.8% APR', term: '5-25 years', amount: 'Up to 100M ₸' },
  { id: 4, name: 'Business Loan', rate: '9.5% APR', term: '1-10 years', amount: 'Up to 50M ₸' }
];

export const LoansPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    term: ''
  });

  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleApply = () => {
    alert(`Application submitted for ${selectedLoan.name}`);
    setShowModal(false);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Quick Loans</h1>

      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Available Loan Products</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                {LOAN_PRODUCTS.map((loan) => (
                  <Col md={6} className="mb-3" key={loan.id}>
                    <Card className="border">
                      <Card.Body>
                        <h6>{loan.name}</h6>
                        <ListGroup variant="flush" className="my-3">
                          <ListGroup.Item className="ps-0 pe-0 border-0">
                            <strong>Rate:</strong> {loan.rate}
                          </ListGroup.Item>
                          <ListGroup.Item className="ps-0 pe-0 border-0">
                            <strong>Term:</strong> {loan.term}
                          </ListGroup.Item>
                          <ListGroup.Item className="ps-0 pe-0 border-0">
                            <strong>Amount:</strong> {loan.amount}
                          </ListGroup.Item>
                        </ListGroup>
                        <Button 
                          variant="primary" 
                          size="sm"
                          className="w-100"
                          onClick={() => handleSelectLoan(loan)}
                        >
                          Apply Now
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
              <h6 className="mb-0">Your Active Loans</h6>
            </Card.Header>
            <ListGroup variant="flush">
              {[
                { id: 1, product: 'Personal Loan', amount: 2000000, remaining: 1250000, paid: 750000, dueDate: '2026-05-15', status: 'Active' },
                { id: 2, product: 'Auto Loan', amount: 5000000, remaining: 3500000, paid: 1500000, dueDate: '2030-12-31', status: 'Active' }
              ].map((activeLoan) => (
                <ListGroup.Item key={activeLoan.id}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-0">{activeLoan.product}</h6>
                      <small className="text-muted">Next Payment: {activeLoan.dueDate}</small>
                    </div>
                    <Badge bg="success">{activeLoan.status}</Badge>
                  </div>
                  <Row className="align-items-center">
                    <Col md={8}>
                      <small className="text-muted">Paid ₸{activeLoan.paid.toLocaleString()} / ₸{activeLoan.amount.toLocaleString()}</small>
                      <ProgressBar variant="success" now={(activeLoan.paid / activeLoan.amount) * 100} className="mt-2" />
                    </Col>
                    <Col md={4}>
                      <small className="text-muted">Remaining: ₸{activeLoan.remaining.toLocaleString()}</small>
                    </Col>
                  </Row>
                  <Button variant="outline-primary" size="sm" className="mt-2">View Details</Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">🎯 Loan Calculator</h6>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Loan Amount</Form.Label>
                <Form.Control type="number" placeholder="0 ₸" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Loan Term</Form.Label>
                <Form.Select>
                  <option>Select term</option>
                  <option>1 year</option>
                  <option>2 years</option>
                  <option>3 years</option>
                  <option>5 years</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Interest Rate</Form.Label>
                <Form.Control type="text" placeholder="8.5%" disabled value="8.5%" />
              </Form.Group>

              <Card className="bg-light">
                <Card.Body>
                  <small className="text-muted">Monthly Payment</small>
                  <h5>₸ 8,500</h5>
                  <small className="text-muted">Total Interest</small>
                  <p className="mb-0">₸ 205,000</p>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Apply Loan Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Apply for {selectedLoan?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Loan Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleChange}
              />
              <small className="text-muted">{selectedLoan?.amount}</small>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loan Term</Form.Label>
              <Form.Select
                name="term"
                value={formData.term}
                onChange={handleChange}
              >
                <option value="">Select term</option>
                <option>1 year</option>
                <option>2 years</option>
                <option>3 years</option>
                <option>5 years</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="success" onClick={handleApply}>Apply Now</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LoansPage;
