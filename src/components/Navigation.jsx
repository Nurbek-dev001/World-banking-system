import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import 'bootstrap/dist/css/bootstrap.min.css';

export const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" expand="lg" sticky="top" className="shadow">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-success">
          🏦 World Bank
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              <>
                <Nav.Link as={Link} to="/"> Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/transfers">Transfers</Nav.Link>
                <Nav.Link as={Link} to="/payments">Payments</Nav.Link>
                <Nav.Link as={Link} to="/marketplace">Shop</Nav.Link>
                <Nav.Link as={Link} to="/loans">Loans</Nav.Link>
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleLogout}
                  className="ms-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
