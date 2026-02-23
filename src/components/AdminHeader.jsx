import React from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout, isAuthenticated } = useAdminAuth();

  // Don't show header on login page
  if (!isAuthenticated || location.pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" expand="lg" sticky="top" className="shadow">
      <Container fluid>
        <Navbar.Brand href="/" className="fw-bold" style={{ color: '#fff !important' }}>
          🏦 World Bank Admin Panel
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/" style={{ color: '#fff' }}>Dashboard</Nav.Link>
            <Nav.Link href="/users" style={{ color: '#fff' }}>All Users</Nav.Link>
            <Nav.Link href="/transactions" style={{ color: '#fff' }}>Transactions</Nav.Link>
            <Nav.Link href="/reports" style={{ color: '#fff' }}>Reports</Nav.Link>
            <Nav.Link href="/settings" style={{ color: '#fff' }}>Settings</Nav.Link>

            <Dropdown className="ms-3">
              <Dropdown.Toggle
                variant="secondary"
                id="dropdown-admin"
                className="d-flex align-items-center"
              >
                👤 {admin?.firstName || 'Admin'}
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Item disabled>
                  <small className="text-muted">{admin?.email}</small>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminHeader;
