import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Pagination, Spinner, Alert } from 'react-bootstrap';
import { useAdminAuth } from '../context/AdminAuthContext';
import api from '../services/api';

export const AllUsersPage = () => {
  const { isAuthenticated } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);

  const limit = 10;

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [page, search, isAuthenticated]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/admin/clients', {
        params: {
          page,
          limit,
          search: search || undefined
        }
      });

      setUsers(response.data.data || []);
      setTotalPages(Math.ceil((response.data.pagination?.total || 0) / limit));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAccounts = async (user) => {
    try {
      setSelectedUser(user);
      const response = await api.get(`/admin/clients/${user._id}`);
      setUserAccounts(response.data.data?.accounts || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to fetch accounts');
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      suspended: 'warning',
      blocked: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'danger',
      merchant: 'info',
      user: 'primary'
    };
    return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
  };

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">👥 All Users</h1>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={handleSearch}
            />
          </Form.Group>
        </Col>
        <Col md={6} className="text-end">
          <Badge bg="primary" className="p-2">Total Users: {users.length}</Badge>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Card className="shadow mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Users List</h6>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>KYC</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <strong>{user.firstName} {user.lastName}</strong>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>{getStatusBadge(user.status)}</td>
                        <td>
                          <Badge bg={user.kycStatus === 'verified' ? 'success' : 'warning'}>
                            {user.kycStatus}
                          </Badge>
                        </td>
                        <td>
                          <small>{new Date(user.createdAt).toLocaleDateString()}</small>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => handleViewAccounts(user)}
                            className="me-2"
                          >
                            View Accounts
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {users.length === 0 && (
                <p className="text-center text-muted py-4">No users found</p>
              )}
            </Card.Body>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mb-4">
              <Pagination>
                <Pagination.First
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                />
                <Pagination.Prev
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                />
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                />
                <Pagination.Last
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                />
              </Pagination>
            </div>
          )}

          {/* Selected User Accounts */}
          {selectedUser && (
            <Card className="shadow">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    💳 Accounts for {selectedUser.firstName} {selectedUser.lastName}
                  </h6>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedUser(null);
                      setUserAccounts([]);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Account Number</th>
                        <th>Type</th>
                        <th>Currency</th>
                        <th>Balance</th>
                        <th>Available Balance</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userAccounts.map((account) => (
                        <tr key={account._id}>
                          <td>
                            <code>{account.accountNumber}</code>
                          </td>
                          <td>
                            <Badge>{account.accountType}</Badge>
                          </td>
                          <td>{account.currency}</td>
                          <td>
                            <strong>₸ {account.balance?.toLocaleString() || 0}</strong>
                          </td>
                          <td>₸ {account.availableBalance?.toLocaleString() || 0}</td>
                          <td>{getStatusBadge(account.status)}</td>
                          <td>
                            <small>{new Date(account.createdAt).toLocaleDateString()}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {userAccounts.length === 0 && (
                  <p className="text-center text-muted py-4">No accounts found</p>
                )}
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default AllUsersPage;
