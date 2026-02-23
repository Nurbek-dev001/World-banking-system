import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge, Nav, Tab } from 'react-bootstrap';

export const ProfilePage = () => {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+77123456789',
    dateOfBirth: '1990-01-15',
    address: 'Almaty, Kazakhstan',
    city: 'Almaty',
    zipCode: '050000'
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">My Account</h1>

      <Tab.Container defaultActiveKey="personal">
        <Row>
          <Col lg={10} className="mx-auto">
            <Nav variant="pills" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="personal">👤 Personal Info</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="security">🔐 Security</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="accounts">💳 My Accounts</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="notifications">🔔 Notifications</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="personal">
                <Card className="shadow">
                  <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Personal Information</h6>
                    <Button 
                      variant={isEditing ? 'secondary' : 'primary'} 
                      size="sm"
                      onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="firstName"
                              value={profile.firstName}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="lastName"
                              value={profile.lastName}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                              type="date"
                              name="dateOfBirth"
                              value={profile.dateOfBirth}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                              type="text"
                              name="city"
                              value={profile.city}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      {isEditing && (
                        <Button variant="success" onClick={handleSave} className="w-100">
                          Save Changes
                        </Button>
                      )}
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="security">
                <Card className="shadow">
                  <Card.Body>
                    <h6 className="mb-4">Security Settings</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">Password</h6>
                          <small className="text-muted">Last changed 3 months ago</small>
                        </div>
                        <Button variant="outline-primary" size="sm">Change</Button>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">Two-Factor Authentication</h6>
                          <small className="text-muted">Not enabled</small>
                        </div>
                        <Button variant="outline-success" size="sm">Enable</Button>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">Fingerprint Login</h6>
                          <small className="text-muted">Not enabled</small>
                        </div>
                        <Button variant="outline-success" size="sm">Enable</Button>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="accounts">
                <Row>
                  {[
                    { name: 'World Gold', balance: 450320.50, type: 'Primary' },
                    { name: 'Savings Account', balance: 1250000, type: 'Savings' },
                    { name: 'Business Account', balance: 0, type: 'Business' }
                  ].map((acc, i) => (
                    <Col md={6} className="mb-3" key={i}>
                      <Card className="shadow">
                        <Card.Body>
                          <h6>{acc.name}</h6>
                          <p className="text-muted mb-2">{acc.type}</p>
                          <h5 className="text-success">₸ {acc.balance.toLocaleString()}</h5>
                          <Button variant="outline-primary" size="sm" className="me-2">Manage</Button>
                          <Button variant="outline-danger" size="sm">Close</Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="notifications">
                <Card className="shadow">
                  <Card.Body>
                    <h6 className="mb-4">Notification Preferences</h6>
                    <Form>
                      <Form.Check 
                        type="switch"
                        label="Email Notifications"
                        defaultChecked
                        className="mb-3"
                      />
                      <Form.Check 
                        type="switch"
                        label="SMS Notifications"
                        defaultChecked
                        className="mb-3"
                      />
                      <Form.Check 
                        type="switch"
                        label="Push Notifications"
                        defaultChecked
                        className="mb-3"
                      />
                      <Form.Check 
                        type="switch"
                        label="Marketing Emails"
                        className="mb-3"
                      />
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default ProfilePage;
