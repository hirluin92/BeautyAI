# Test Document: Staff Management and Booking System

## Overview
This document outlines the testing procedures for the staff management system and booking integration that has been implemented.

## 1. Staff Management System

### 1.1 Staff Creation
**Test Steps:**
1. Navigate to `/staff/new`
2. Fill out the staff form with:
   - Full Name: "Mario Rossi"
   - Email: "mario.rossi@example.com"
   - Phone: "+39 123 456 789"
   - Role: "Estetista"
   - Specializations: ["Trattamenti viso", "Massaggi"]
   - Notes: "Specializzato in trattamenti anti-aging"
   - Is Active: true
3. Submit the form
4. Verify staff member is created and redirected to staff list

**Expected Results:**
- Staff member appears in the staff table
- All fields are correctly saved
- Specializations are displayed as badges

### 1.2 Staff Listing and Search
**Test Steps:**
1. Navigate to `/staff`
2. Verify all staff members are displayed
3. Use search functionality to find "Mario"
4. Test active/inactive filter
5. Click on a staff member to view details

**Expected Results:**
- Staff table shows all active staff members
- Search filters results correctly
- Staff details page displays all information

### 1.3 Staff Editing
**Test Steps:**
1. Navigate to a staff member's detail page
2. Click "Modifica" button
3. Update the role to "Senior Estetista"
4. Add a new specialization: "Trattamenti corpo"
5. Save changes

**Expected Results:**
- Changes are saved successfully
- Updated information is displayed on detail page
- Specializations are updated correctly

### 1.4 Staff Deletion
**Test Steps:**
1. Navigate to staff list
2. Click delete button on a staff member
3. Confirm deletion in modal
4. Verify staff member is removed

**Expected Results:**
- Staff member is deleted from database
- Staff member no longer appears in list
- No errors occur during deletion

## 2. Booking System Integration

### 2.1 Creating Bookings with Staff Assignment
**Test Steps:**
1. Navigate to `/bookings/new`
2. Select a client
3. Select a service
4. Select a staff member from the dropdown
5. Choose date and time
6. Set status to "confirmed"
7. Add notes if needed
8. Submit booking

**Expected Results:**
- Booking is created successfully
- Staff member is correctly assigned
- Booking appears in calendar view
- No TypeScript errors occur

### 2.2 Editing Bookings with Staff
**Test Steps:**
1. Navigate to an existing booking
2. Click "Modifica"
3. Change the assigned staff member
4. Update booking time
5. Save changes

**Expected Results:**
- Booking is updated successfully
- Staff assignment is changed
- Calendar view reflects changes
- No type errors occur

### 2.3 Calendar View with Staff Filter
**Test Steps:**
1. Navigate to `/calendar`
2. Use staff filter to show only bookings for specific staff
3. Test "Tutte / Solo le mie" filter
4. Verify bookings are filtered correctly

**Expected Results:**
- Staff filter works correctly
- "Solo le mie" shows only current user's bookings
- Calendar displays filtered results properly

## 3. API Endpoints Testing

### 3.1 Staff API
**Test Endpoints:**
- `GET /api/staff` - List all staff
- `POST /api/staff` - Create new staff
- `PUT /api/staff` - Update staff
- `DELETE /api/staff?id=xxx` - Delete staff

**Expected Results:**
- All endpoints return correct data
- Validation works properly
- Authorization is enforced
- Error handling works correctly

### 3.2 Booking API with Staff
**Test Endpoints:**
- `GET /api/bookings` - List bookings with staff info
- `POST /api/bookings` - Create booking with staff_id
- `PUT /api/bookings/[id]` - Update booking with staff changes

**Expected Results:**
- Staff information is included in responses
- Staff assignments are saved correctly
- No type mismatches occur

## 4. Type Safety Verification

### 4.1 TypeScript Compilation
**Test Steps:**
1. Run `npx tsc --noEmit`
2. Check for any type errors related to staff or bookings

**Expected Results:**
- No type errors related to staff management
- No type errors related to booking forms
- All interfaces are properly defined

### 4.2 Zod Validation
**Test Steps:**
1. Submit forms with invalid data
2. Test required field validation
3. Test email format validation
4. Test array validation for specializations

**Expected Results:**
- Validation errors are displayed
- Invalid data is rejected
- Form state is managed correctly

## 5. Database Schema Verification

### 5.1 Staff Table
**Verify Fields:**
- `id` (UUID, primary key)
- `organization_id` (UUID, foreign key)
- `full_name` (text, required)
- `email` (text, nullable)
- `phone` (text, nullable)
- `role` (text, nullable)
- `specializations` (text[], nullable)
- `notes` (text, nullable)
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 5.2 Bookings Table with Staff
**Verify Fields:**
- `staff_id` (UUID, foreign key to staff table)
- All existing booking fields remain intact

## 6. Performance Testing

### 6.1 Staff List Performance
**Test Steps:**
1. Create 100+ staff members
2. Load staff list page
3. Test search functionality
4. Test filtering

**Expected Results:**
- Page loads within 2 seconds
- Search is responsive
- No memory leaks

### 6.2 Booking Performance
**Test Steps:**
1. Create 1000+ bookings
2. Load calendar view
3. Test staff filtering
4. Test date range filtering

**Expected Results:**
- Calendar loads within 3 seconds
- Filtering is responsive
- No performance degradation

## 7. Security Testing

### 7.1 Authorization
**Test Steps:**
1. Try to access staff API without authentication
2. Try to access other organization's staff data
3. Test staff deletion permissions

**Expected Results:**
- Unauthorized access is blocked
- Organization isolation is enforced
- Proper error messages are returned

### 7.2 Data Validation
**Test Steps:**
1. Submit malicious data in forms
2. Test SQL injection attempts
3. Test XSS attempts

**Expected Results:**
- Malicious data is rejected
- Input is properly sanitized
- No security vulnerabilities

## 8. Mobile Responsiveness

### 8.1 Staff Management
**Test Steps:**
1. Test staff forms on mobile devices
2. Test staff table on small screens
3. Test staff detail pages on mobile

**Expected Results:**
- Forms are usable on mobile
- Tables are responsive
- Navigation works on touch devices

### 8.2 Booking System
**Test Steps:**
1. Test booking forms on mobile
2. Test calendar view on mobile
3. Test staff selection on mobile

**Expected Results:**
- All functionality works on mobile
- UI is touch-friendly
- No horizontal scrolling issues

## 9. Error Handling

### 9.1 Network Errors
**Test Steps:**
1. Disconnect internet during API calls
2. Test with slow network
3. Test with server errors

**Expected Results:**
- Graceful error handling
- User-friendly error messages
- Retry mechanisms work

### 9.2 Validation Errors
**Test Steps:**
1. Submit invalid data
2. Test required field validation
3. Test format validation

**Expected Results:**
- Clear error messages
- Form state is preserved
- User can correct errors easily

## 10. Integration Testing

### 10.1 End-to-End Workflow
**Test Steps:**
1. Create a new staff member
2. Create a booking with that staff member
3. Edit the booking
4. View booking in calendar
5. Delete the booking
6. Verify staff member still exists

**Expected Results:**
- Complete workflow works seamlessly
- Data consistency is maintained
- No orphaned records

## Deployment Checklist

### 10.2 Pre-Deployment
- [ ] All TypeScript errors resolved
- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Mobile responsiveness verified

### 10.3 Post-Deployment
- [ ] Staff management functionality verified
- [ ] Booking system with staff works
- [ ] Calendar filters function correctly
- [ ] Performance meets requirements
- [ ] Security measures in place
- [ ] Error monitoring configured

## Notes
- The staff management system is now fully integrated with the booking system
- All TypeScript errors related to staff types have been resolved
- The system supports both individual staff management and booking assignment
- Calendar filters now include staff-based filtering
- The implementation follows best practices for type safety and validation 