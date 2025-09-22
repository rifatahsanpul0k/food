-- Sample data for food_ordering schema (adjust IDs if needed)
INSERT INTO users (name, email, phone) VALUES
('Alice Johnson','alice@example.com','1234567890'),
('Bob Smith','bob@example.com','2345678901'),
('Charlie Lee','charlie@example.com','3456789012');

INSERT INTO restaurants (name, location, rating) VALUES
('Pasta Palace','Downtown',4.5),
('Burger Barn','Uptown',4.2),
('Sushi Central','Midtown',4.8);

INSERT INTO menu_items (restaurant_id, name, price, category, description, is_available) VALUES
(1,'Spaghetti Carbonara',12.99,'Pasta','Classic Roman pasta',true),
(1,'Fettuccine Alfredo',11.49,'Pasta','Creamy alfredo sauce',true),
(2,'Cheeseburger',8.99,'Burger','Beef, cheese, lettuce',true),
(2,'Veggie Burger',7.99,'Burger','Plant-based patty',true),
(3,'Salmon Nigiri',10.49,'Sushi','Fresh salmon',true),
(3,'California Roll',6.99,'Sushi','Crab, avocado, cucumber',true);

-- Sample orders
INSERT INTO orders (user_id, restaurant_id, total, status) VALUES
(1, 1, 24.48, 'DELIVERED'),
(2, 2, 8.99, 'PENDING'),
(3, 3, 17.48, 'CONFIRMED');

-- Sample order items
INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
(1, 1, 1, 12.99),
(1, 2, 1, 11.49),
(2, 3, 1, 8.99),
(3, 5, 1, 10.49),
(3, 6, 1, 6.99);
