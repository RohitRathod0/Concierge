INSERT INTO et_products (product_code, name, description, category, pricing_model, price_inr, trial_available, trial_duration_days, target_segments) VALUES
('et_prime', 'ET Prime', 'Premium content subscription', 'content', 'subscription', 999.00, true, 7, '["tech_professional_investor", "experienced_trader", "wealth_builder"]'),
('et_markets', 'ET Markets', 'Real-time market data and analysis', 'data', 'free', 0.00, false, null, '["all"]'),
('beginner_masterclass', 'Stock Market Basics Masterclass', 'Comprehensive course for beginners', 'events', 'one_time', 2999.00, false, null, '["tech_professional_investor", "learning_focused"]'),
('wealth_summit_2026', 'ET Wealth Summit 2026', 'Annual wealth management conference', 'events', 'one_time', 4999.00, false, null, '["experienced_trader", "wealth_builder"]'),
('tax_planning_guide', 'Tax Planning Guide', 'Comprehensive tax planning resource', 'content', 'free', 0.00, false, null, '["all"]')
ON CONFLICT (product_code) DO NOTHING;
