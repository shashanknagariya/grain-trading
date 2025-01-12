# Project Status

## New Features - Payment Management System

### 1. Purchase List Page Modifications
- [ ] Simplify purchase list view
  - [ ] Show only essential columns (name, bill number, date, total, payment_status)
  - [ ] Add click functionality to view detailed bill
  - [ ] Style the list for better readability

### 2. Purchase Detail Page
- [ ] Create new route and page for purchase details
  - [ ] Display complete bill information
  - [ ] Show payment history section
  - [ ] Add payment status management UI
  - [ ] Style the detail view

### 3. Payment Status Feature
- [ ] Database Updates
  - [ ] Add payment_status field to Purchase table
  - [ ] Create new PaymentHistory table
  - [ ] Add necessary foreign key relationships
  - [ ] Create database migrations

- [ ] Backend API Development
  - [ ] Add payment status update endpoint
  - [ ] Create payment history endpoints (create/list)
  - [ ] Update purchase endpoints to include payment info
  - [ ] Add validation and error handling

- [ ] Frontend Components
  - [ ] Create PaymentStatus dropdown component
  - [ ] Implement payment amount input dialog
  - [ ] Add payment history display component
  - [ ] Handle status change interactions

### 4. Payment History Implementation
- [ ] Backend Development
  - [ ] Create PaymentHistory model
  - [ ] Implement CRUD operations
  - [ ] Add payment history to purchase details API

- [ ] Frontend Development
  - [ ] Create payment history list component
  - [ ] Implement payment history in purchase detail page
  - [ ] Add payment entry form
  - [ ] Style payment history display

## New Features - Purchase Bill Management

### Print Bill Feature
1. Design Tasks:
   - [ ] Create a professional bill layout template
   - [ ] Add company header/logo section
   - [ ] Design tabular format for purchase details
   - [ ] Add signature and terms & conditions section
   - [ ] Include payment history section
   - [ ] Add footer with contact information

2. Implementation Tasks:
   - [ ] Create PrintableBill component
   - [ ] Implement print functionality using react-to-print
   - [ ] Add print preview dialog
   - [ ] Style print output (CSS for print media)
   - [ ] Add print button in PurchaseDetail page

3. Bill Content:
   - [ ] Company details section
   - [ ] Bill number and date
   - [ ] Supplier details
   - [ ] Purchase details (grain, weight, rate)
   - [ ] Payment information
   - [ ] Terms and conditions
   - [ ] Authorized signature space

### Delete Bill Feature
1. Implementation Tasks:
   - [ ] Add delete confirmation dialog
   - [ ] Implement delete API endpoint
   - [ ] Add delete button in PurchaseDetail page
   - [ ] Handle inventory updates after deletion
   - [ ] Add success/error notifications

2. Security Tasks:
   - [ ] Add permission check for deletion
   - [ ] Validate deletion constraints
   - [ ] Add audit logging for deletions

## Current Sprint Tasks
1. Database Schema Updates
   - [ ] Add payment_status to Purchase model
   - [ ] Create PaymentHistory model
   - [ ] Create migrations

2. Purchase List Page
   - [ ] Update purchase list columns
   - [ ] Add navigation to detail page
   - [ ] Update styling

3. Backend APIs
   - [ ] Implement payment status endpoints
   - [ ] Create payment history endpoints

4. Frontend Components
   - [ ] Create purchase detail page
   - [ ] Implement payment status management
   - [ ] Add payment history display

## Next Steps
1. Start with database schema updates
2. Implement basic payment status functionality
3. Create purchase detail page
4. Add payment history features 

## New Features - Sales Module Enhancements

### 1. Currency Format Update
- [ ] Update formatCurrency utility to use Indian Rupee symbol (₹)
- [ ] Apply currency format changes across all sales components

### 2. Sales Bill Redesign
- [ ] Create new bill layout matching provided template
  - [ ] Add company logo and header section
  - [ ] Add GST, PAN details
  - [ ] Add transportation details section
  - [ ] Add bank details section
  - [ ] Add terms and conditions
- [ ] Update PrintableSalesBill component
- [ ] Add new fields to sales form:
  - [ ] Transportation Mode
  - [ ] Vehicle Number
  - [ ] Driver Name
  - [ ] LR Number
  - [ ] PO Number
  - [ ] Buyer's GST Number

### 3. Sales Bill Number Automation
- [ ] Implement auto-generation logic (format: SB-YYYYMMDD-XXXX)
- [ ] Remove bill number field from sales form
- [ ] Update backend API to handle auto-generation

### 4. Inventory Validation
- [ ] Add stock validation in backend before sale creation
- [ ] Show appropriate error messages for insufficient stock
- [ ] Add frontend validation for quantity/bags

### 5. Godown-wise Inventory Management
- [ ] Add godown selection in sales form
- [ ] Allow selecting multiple godowns with bag quantities
- [ ] Update inventory tables for each godown
- [ ] Add validation for godown-wise available bags

### Database Updates
- [ ] Add new fields to sales table
- [ ] Create sales_godown_details table for tracking godown-wise sales
- [ ] Add transportation and buyer details fields

### API Updates
- [ ] Update sales creation endpoint
- [ ] Add godown inventory validation
- [ ] Add endpoints for fetching available stock by godown 