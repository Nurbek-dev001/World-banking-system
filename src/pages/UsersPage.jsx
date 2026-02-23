import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, InputGroup } from 'react-bootstrap';

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+77123456789', status: 'active', joined: '2026-01-15', kyc: 'verified' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+77987654321', status: 'active', joined: '2026-01-20', kyc: 'pending' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', phone: '+77555555555', status: 'blocked', joined: '2026-01-10', kyc: 'verified' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', phone: '+77444444444', status: 'active', joined: '2026-02-01', kyc: 'verified' },
  { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', phone: '+77333333333', status: 'inactive', joined: '2025-12-15', kyc: 'rejected' }
];

export const UsersPage = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleUserStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' }
        : user
    ));
  };

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Users Management</h1>

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button variant="primary" className="w-100">📊 Export</Button>
        </Col>
      </Row>

      {/* Users Table */}
      <Card className="shadow">
        <Card.Body>
          <div className="table-responsive">
            <Table hover striped>
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>KYC Status</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.joined}</td>
                    <td>
                      <Badge bg={user.kyc === 'verified' ? 'success' : user.kyc === 'pending' ? 'warning' : 'danger'}>
                        {user.kyc}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={user.status === 'active' ? 'success' : user.status === 'inactive' ? 'secondary' : 'danger'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.status === 'active' ? 'Block' : 'Unblock'}
                      </Button>
                      <Button variant="outline-danger" size="sm">Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="text-center mt-3">
            <small className="text-muted">Showing {filteredUsers.length} of {users.length} users</small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UsersPage;
