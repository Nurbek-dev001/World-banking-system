import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAdminAuth } from '../context/AdminAuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, error } = useAdminAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');

    try {
      await login(loginForm.email, loginForm.password);
      navigate('/');
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');

    try {
      await register(
        registerForm.firstName,
        registerForm.lastName,
        registerForm.email,
        registerForm.password,
        registerForm.phone
      );
      navigate('/');
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
      <Container>
        <Row className="align-items-center justify-content-center">
          <Col md={5}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h1 className="mb-2">🏦 World Bank</h1>
                  <h4>Admin Panel</h4>
                  <p className="text-muted">Manage users and accounts</p>
                </div>

                {(error || localError) && (
                  <Alert variant="danger" dismissible onClose={() => setLocalError('')}>
                    {error || localError}
                  </Alert>
                )}

                {isLogin ? (
                  <Form onSubmit={handleLoginSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="admin@worldbank.com"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        required
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>

                    <p className="text-center text-muted">
                      Don't have an admin account?{' '}
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => setIsLogin(false)}
                        style={{ textDecoration: 'none', padding: 0 }}
                      >
                        Register here
                      </button>
                    </p>
                  </Form>
                ) : (
                  <Form onSubmit={handleRegisterSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            placeholder="John"
                            value={registerForm.firstName}
                            onChange={handleRegisterChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            placeholder="Doe"
                            value={registerForm.lastName}
                            onChange={handleRegisterChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="admin@worldbank.com"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        placeholder="+7 (XXX) XXX-XX-XX"
                        value={registerForm.phone}
                        onChange={handleRegisterChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        required
                      />
                    </Form.Group>

                    <Button
                      variant="success"
                      type="submit"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Registering...' : 'Register'}
                    </Button>

                    <p className="text-center text-muted">
                      Already have an account?{' '}
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => setIsLogin(true)}
                        style={{ textDecoration: 'none', padding: 0 }}
                      >
                        Login here
                      </button>
                    </p>
                  </Form>
                )}

                <hr className="my-4" />
                <p className="text-center text-muted small mb-0">
                  For admin access only. Unauthorized access is prohibited.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
