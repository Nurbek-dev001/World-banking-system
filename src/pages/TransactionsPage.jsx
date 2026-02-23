import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, InputGroup } from 'react-bootstrap';

const mockTransactions = [
  { id: 'TXN001', user: 'John Doe', type: 'transfer', amount: 50000, status: 'completed', date: '2026-02-17 14:30', merchant: 'Jane Smith' },
  { id: 'TXN002', user: 'Jane Smith', type: 'payment', amount: 8500, status: 'completed', date: '2026-02-17 13:15', merchant: 'Electricity Bill' },
  { id: 'TXN003', user: 'Bob Wilson', type: 'withdrawal', amount: 100000, status: 'pending', date: '2026-02-17 12:45', merchant: 'ATM #1234' },
  { id: 'TXN004', user: 'Alice Brown', type: 'deposit', amount: 200000, status: 'completed', date: '2026-02-17 11:20', merchant: 'Bank Transfer' },
  { id: 'TXN005', user: 'Charlie Davis', type: 'transfer', amount: 75000, status: 'failed', date: '2026-02-17 10:05', merchant: 'John Doe' }
];

export const TransactionsPage = () => {
  const [transactions] = useState(mockTransactions);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchesType && matchesStatus;
  });

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Transactions</h1>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="transfer">Transfer</option>
            <option value="payment">Payment</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control placeholder="Search transaction ID..." />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Button variant="primary" className="w-100">📊 Export</Button>
        </Col>
      </Row>

      {/* Transactions Table */}
      <Card className="shadow">
        <Card.Body>
          <div className="table-responsive">
            <Table hover striped>
              <thead className="table-light">
                <tr>
                  <th>Transaction ID</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Merchant</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td><code>{tx.id}</code></td>
                    <td>{tx.user}</td>
                    <td>
                      <Badge bg="info">{tx.type}</Badge>
                    </td>
                    <td><strong>₸ {tx.amount.toLocaleString()}</strong></td>
                    <td>{tx.merchant}</td>
                    <td><small>{tx.date}</small></td>
                    <td>
                      <Badge bg={
                        tx.status === 'completed' ? 'success' :
                        tx.status === 'pending' ? 'warning' : 'danger'
                      }>
                        {tx.status}
                      </Badge>
                    </td>
                    <td>
                      <Button variant="outline-primary" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="text-center mt-3">
            <small className="text-muted">Showing {filteredTransactions.length} of {transactions.length} transactions</small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TransactionsPage;
