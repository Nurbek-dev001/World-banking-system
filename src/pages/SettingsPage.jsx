import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge, Nav, Tab } from 'react-bootstrap';

export const SettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'World Bank',
    adminEmail: 'admin@world.kz',
    supportEmail: 'support@world.kz',
    maintenanceMode: false,
    enableUserRegistration: true,
    enableTransfers: true,
    maxTransferAmount: 10000000,
    dailyTransactionLimit: 100000000,
    emailNotifications: true,
    smsNotifications: true
  });

  const [smsConfig, setSmsConfig] = useState({
    provider: 'twilio',
    apiKey: '****',
    isConfigured: true
  });

  const [emailConfig, setEmailConfig] = useState({
    provider: 'sendgrid',
    apiKey: '****',
    isConfigured: true
  });

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">System Settings</h1>

      <Tab.Container defaultActiveKey="general">
        <Row>
          <Col lg={10} className="mx-auto">
            <Nav variant="pills" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="general">⚙️ General Settings</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="features">✨ Features</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="limits">📊 Limits & Thresholds</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="integrations">🔗 Integrations</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="security">🔐 Security</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* General Settings */}
              <Tab.Pane eventKey="general">
                <Card className="shadow">
                  <Card.Body>
                    <h6 className="mb-4">General Configuration</h6>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Platform Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={settings.siteName}
                          onChange={(e) => handleSettingChange('siteName', e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Admin Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={settings.adminEmail}
                          onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Support Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={settings.supportEmail}
                          onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Check
                          type="switch"
                          label="Maintenance Mode"
                          checked={settings.maintenanceMode}
                          onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                        />
                        <small className="text-muted">Disable access for regular users</small>
                      </Form.Group>

                      <Button variant="success" onClick={handleSave}>Save Changes</Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Features */}
              <Tab.Pane eventKey="features">
                <Card className="shadow">
                  <Card.Body>
                    <h6 className="mb-4">Feature Controls</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">User Registration</h6>
                          <small className="text-muted">Allow new users to sign up</small>
                        </div>
                        <Form.Check
                          type="switch"
                          checked={settings.enableUserRegistration}
                          onChange={(e) => handleSettingChange('enableUserRegistration', e.target.checked)}
                        />
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">Money Transfers</h6>
                          <small className="text-muted">Enable user-to-user transfers</small>
                        </div>
                        <Form.Check
                          type="switch"
                          checked={settings.enableTransfers}
                          onChange={(e) => handleSettingChange('enableTransfers', e.target.checked)}
                        />
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">Email Notifications</h6>
                          <small className="text-muted">Send email alerts to users</small>
                        </div>
                        <Form.Check
                          type="switch"
                          checked={settings.emailNotifications}
                          onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        />
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">SMS Notifications</h6>
                          <small className="text-muted">Send SMS alerts to users</small>
                        </div>
                        <Form.Check
                          type="switch"
                          checked={settings.smsNotifications}
                          onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                        />
                      </ListGroup.Item>
                    </ListGroup>
                    <Button variant="success" onClick={handleSave} className="mt-4">Save Changes</Button>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Limits */}
              <Tab.Pane eventKey="limits">
                <Card className="shadow">
                  <Card.Body>
                    <h6 className="mb-4">Limits & Thresholds</h6>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Max Transfer Amount (₸)</Form.Label>
                        <Form.Control
                          type="number"
                          value={settings.maxTransferAmount}
                          onChange={(e) => handleSettingChange('maxTransferAmount', e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Daily Transaction Limit (₸)</Form.Label>
                        <Form.Control
                          type="number"
                          value={settings.dailyTransactionLimit}
                          onChange={(e) => handleSettingChange('dailyTransactionLimit', e.target.value)}
                        />
                      </Form.Group>

                      <Button variant="success" onClick={handleSave}>Save Changes</Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Integrations */}
              <Tab.Pane eventKey="integrations">
                <Row>
                  <Col md={6}>
                    <Card className="shadow">
                      <Card.Header className="bg-light">
                        <h6 className="mb-0">SMS Provider</h6>
                      </Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Provider</Form.Label>
                          <Form.Select value={smsConfig.provider} disabled>
                            <option>twilio</option>
                            <option>nexmo</option>
                            <option>aws-sns</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>API Key</Form.Label>
                          <Form.Control type="password" value={smsConfig.apiKey} disabled />
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center">
                          <Badge bg="success">Connected</Badge>
                          <Button variant="outline-primary" size="sm">Reconfigure</Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="shadow">
                      <Card.Header className="bg-light">
                        <h6 className="mb-0">Email Provider</h6>
                      </Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Provider</Form.Label>
                          <Form.Select value={emailConfig.provider} disabled>
                            <option>sendgrid</option>
                            <option>mailgun</option>
                            <option>aws-ses</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>API Key</Form.Label>
                          <Form.Control type="password" value={emailConfig.apiKey} disabled />
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center">
                          <Badge bg="success">Connected</Badge>
                          <Button variant="outline-primary" size="sm">Reconfigure</Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              {/* Security */}
              <Tab.Pane eventKey="security">
                <Card className="shadow">
                  <Card.Body>
                    <h6 className="mb-4">Security Settings</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">Two-Factor Authentication</h6>
                          <small className="text-muted">Required for admin accounts</small>
                        </div>
                        <Badge bg="success">Enabled</Badge>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">IP Whitelist</h6>
                          <small className="text-muted">Restrict admin access by IP</small>
                        </div>
                        <Button variant="outline-primary" size="sm">Configure</Button>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">SSL Certificate</h6>
                          <small className="text-muted">Last updated: 2026-01-15</small>
                        </div>
                        <Badge bg="success">Valid</Badge>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <h6 className="mb-3">Change Admin Password</h6>
                        <Form>
                          <Form.Group className="mb-2">
                            <Form.Control type="password" placeholder="Current password" />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Control type="password" placeholder="New password" />
                          </Form.Group>
                          <Button variant="primary">Update Password</Button>
                        </Form>
                      </ListGroup.Item>
                    </ListGroup>
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

export default SettingsPage;
