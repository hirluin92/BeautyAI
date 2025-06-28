-- Add financial columns to bookings table for financial analytics
-- These columns are needed for the financial stats, staff performance, and export APIs

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS actual_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS fiscal_document VARCHAR(50),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN bookings.actual_amount IS 'Actual amount paid (may differ from price due to discounts/adjustments)';
COMMENT ON COLUMN bookings.vat_amount IS 'VAT amount for fiscal compliance';
COMMENT ON COLUMN bookings.payment_method IS 'Payment method: cash, card, transfer, mixed';
COMMENT ON COLUMN bookings.fiscal_document IS 'Fiscal document type: receipt, invoice, none';
COMMENT ON COLUMN bookings.completed_at IS 'Timestamp when the booking was completed';

-- Create indexes for better performance on financial queries
CREATE INDEX IF NOT EXISTS idx_bookings_completed_at ON bookings(completed_at);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);
CREATE INDEX IF NOT EXISTS idx_bookings_fiscal_document ON bookings(fiscal_document);
CREATE INDEX IF NOT EXISTS idx_bookings_actual_amount ON bookings(actual_amount); 