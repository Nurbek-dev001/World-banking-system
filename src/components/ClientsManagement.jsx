import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Alert } from 'react-bootstrap';

export default function ClientsManagement() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const limit = 10;

  useEffect(() => {
    fetchClients();
  }, [page, search, statusFilter]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(
        `http://localhost:5000/api/admin/clients?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setClients(response.data.data);
      setTotal(response.data.pagination?.total || 0);
    } catch (err) {
      setError('Failed to fetch clients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/admin/seed',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage(`✅ Database seeded! Created ${response.data.data.usersCreated} test clients`);
      setTimeout(() => fetchClients(), 1000);
    } catch (err) {
      setError('Failed to seed database: ' + err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const blockClient = async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/admin/users/${clientId}/block`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage('Client blocked successfully');
      fetchClients();
    } catch (err) {
      setError('Failed to block client');
    }
  };

  const unblockClient = async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/admin/users/${clientId}/unblock`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage('Client unblocked successfully');
      fetchClients();
    } catch (err) {
      setError('Failed to unblock client');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'info';
    if (score >= 55) return 'warning';
    return 'danger';
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">💼 Clients Management</h1>

      {message && <Alert variant="success" onClose={() => setMessage('')} dismissible>{message}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Search Clients</Form.Label>
            <Form.Control
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Filter by Status</Form.Label>
            <Form.Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="suspended">Suspended</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button 
            variant="primary" 
            onClick={seedDatabase}
            disabled={loading}
            className="w-100"
          >
            🌱 Seed DB
          </Button>
        </Col>
      </Row>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Body>
              <h5>Total Clients: {total}</h5>
              <Table hover responsive>
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Loan Score</th>
                    <th>Deposit Score</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client._id}>
                      <td>{client.firstName} {client.lastName}</td>
                      <td>{client.email}</td>
                      <td>
                        <Badge bg={getScoreColor(client.financial.loanScore.score)}>
                          {client.financial.loanScore.score}/100
                        </Badge>
                        {' '}
                        <small>{client.financial.loanScore.status}</small>
                      </td>
                      <td>
                        <Badge bg={getScoreColor(client.financial.depositScore.score)}>
                          {client.financial.depositScore.score}/100
                        </Badge>
                        {' '}
                        <small>{client.financial.depositScore.tier}</small>
                      </td>
                      <td>${client.financial.currentBalance?.toLocaleString() || 0}</td>
                      <td>
                        <Badge bg={client.status === 'active' ? 'success' : 'danger'}>
                          {client.status}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          variant="info" 
                          size="sm"
                          onClick={() => setSelectedClient(client)}
                          className="me-2"
                        >
                          View
                        </Button>
                        {client.status === 'active' ? (
                          <Button 
                            variant="danger"
                            size="sm"
                            onClick={() => blockClient(client._id)}
                          >
                            Block
                          </Button>
                        ) : (
                          <Button 
                            variant="success"
                            size="sm"
                            onClick={() => unblockClient(client._id)}
                          >
                            Unblock
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-between">
                <Button 
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span>Page {page} of {Math.ceil(total / limit)}</span>
                <Button 
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  Next
                </Button>
              </div>
            </Card.Body>
          </Card>

          {selectedClient && (
            <Card className="bg-light">
              <Card.Header>
                <h5>{selectedClient.firstName} {selectedClient.lastName} - Detailed Profile</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6>Basic Info</h6>
                    <p><strong>Email:</strong> {selectedClient.email}</p>
                    <p><strong>Phone:</strong> {selectedClient.phone}</p>
                    <p><strong>Status:</strong> <Badge>{selectedClient.status}</Badge></p>
                    <p><strong>KYC:</strong> <Badge>{selectedClient.kycStatus}</Badge></p>
                  </Col>
                  <Col md={6}>
                    <h6>Financial Profile</h6>
                    <p><strong>Monthly Income:</strong> ${selectedClient.financial.monthlyIncome?.toLocaleString() || 'N/A'}</p>
                    <p><strong>Credit Score:</strong> {selectedClient.financial.creditScore || 'N/A'}</p>
                    <p><strong>Current Balance:</strong> ${selectedClient.financial.currentBalance?.toLocaleString() || 'N/A'}</p>
                    <p><strong>Previous Deposits:</strong> {selectedClient.financial.previousDeposits || 0}</p>
                  </Col>
                </Row>

                <hr />

                <Row>
                  <Col md={6}>
                    <h6>🏦 Loan Eligibility</h6>
                    <Card bg={getScoreColor(selectedClient.financial.loanScore.score)}>
                      <Card.Body className="text-white">
                        <p><strong>Score:</strong> {selectedClient.financial.loanScore.score}/100</p>
                        <p><strong>Status:</strong> {selectedClient.financial.loanScore.status}</p>
                        <p><strong>Tier:</strong> {selectedClient.financial.loanScore.tier}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <h6>💰 Deposit Eligibility</h6>
                    <Card bg={getScoreColor(selectedClient.financial.depositScore.score)}>
                      <Card.Body className="text-white">
                        <p><strong>Score:</strong> {selectedClient.financial.depositScore.score}/100</p>
                        <p><strong>Tier:</strong> {selectedClient.financial.depositScore.tier}</p>
                        <p><strong>Interest Rate:</strong> {selectedClient.financial.depositScore.interestRate}%</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Button variant="secondary" onClick={() => setSelectedClient(null)} className="mt-3">
                  Close
                </Button>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
