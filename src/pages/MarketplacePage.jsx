import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, ListGroup } from 'react-bootstrap';

const PRODUCTS = [
  { id: 1, name: 'Laptop', price: 500000, category: 'Electronics', image: '💻' },
  { id: 2, name: 'Smartphone', price: 300000, category: 'Electronics', image: '📱' },
  { id: 3, name: 'Headphones', price: 50000, category: 'Electronics', image: '🎧' },
  { id: 4, name: 'Watch', price: 100000, category: 'Accessories', image: '⌚' },
  { id: 5, name: 'Camera', price: 400000, category: 'Electronics', image: '📷' },
  { id: 6, name: 'Tablet', price: 250000, category: 'Electronics', image: '📲' }
];

export const MarketplacePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);

  const categories = ['All', ...new Set(PRODUCTS.map(p => p.category))];
  const filteredProducts = selectedCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <Container className="py-4">
      <h1 className="mb-4">World Marketplace</h1>

      <Row className="mb-4">
        <Col lg={3}>
          <Card className="shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Categories</h6>
            </Card.Header>
            <ListGroup variant="flush">
              {categories.map((cat) => (
                <ListGroup.Item 
                  key={cat}
                  as="button"
                  variant={selectedCategory === cat ? 'success' : 'light'}
                  onClick={() => setSelectedCategory(cat)}
                  className="d-flex justify-content-between align-items-center"
                >
                  {cat}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          <Card className="shadow mt-3">
            <Card.Body>
              <h6 className="mb-3">Price Range</h6>
              <Form.Range min={0} max={1000000} step={10000} />
              <small className="text-muted">₸0 - ₸1,000,000</small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <Row>
            {filteredProducts.map((product) => (
              <Col sm={6} lg={4} className="mb-4" key={product.id}>
                <Card className="shadow h-100">
                  <Card.Body className="text-center">
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>{product.image}</div>
                    <h6>{product.name}</h6>
                    <p className="text-muted mb-1">{product.category}</p>
                    <h5 className="text-success">₸ {product.price.toLocaleString()}</h5>
                    <Badge bg="info" className="mb-3">with Installment</Badge>
                    <div className="d-grid gap-2">
                      <Button variant="primary" size="sm">👁️ View Details</Button>
                      <Button variant="success" size="sm" onClick={() => setCartCount(cartCount + 1)}>
                        🛒 Add to Cart
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      <Card className="shadow mt-4 bg-light">
        <Card.Body className="text-center">
          <h5 className="mb-2">Why Buy from World Marketplace?</h5>
          <Row className="text-center">
            <Col md={3}>
              <h6>✅ Secure Payment</h6>
              <small className="text-muted">All transactions encrypted</small>
            </Col>
            <Col md={3}>
              <h6>📦 Fast Delivery</h6>
              <small className="text-muted">Same day delivery available</small>
            </Col>
            <Col md={3}>
              <h6>💳 Installments</h6>
              <small className="text-muted">Pay in 3-12 months</small>
            </Col>
            <Col md={3}>
              <h6>🔄 Easy Returns</h6>
              <small className="text-muted">30-day return policy</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="fixed-bottom bg-white border-top p-3" style={{ zIndex: 100 }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <span className="badge bg-primary text-white" style={{ fontSize: '18px' }}>
              Cart: {cartCount} items
            </span>
            <Button variant="success" size="lg">
              View Cart → Checkout
            </Button>
          </div>
        </Container>
      </div>
    </Container>
  );
};

export default MarketplacePage;
