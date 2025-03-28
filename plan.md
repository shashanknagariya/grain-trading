# Issue Fix Plan

## 1. Inventory Update After Sale Operations 
- [x] Check sale deletion endpoint in backend
- [x] Add inventory update logic after sale deletion
- [x] Verify inventory updates after sale creation/deletion

## 2. Add Number of Bags Column to Sales Page
- [x] Update Sales page component to include number of bags column
- [x] Add translation keys for the new column
- [x] Ensure proper alignment and formatting

## 3. Enhance Sale Detail Popup
- [x] Add more transaction details to the popup
- [x] Fix close button translation
- [x] Improve layout and formatting

## 4. Fix Purchase Print Page
- [x] Update description of goods to show grain name
- [x] Verify other print details are correct

## 5. Hindi Translation Issues
- [x] Add missing Hindi translations for purchase page columns
- [x] Test language switching
- [x] Verify all translations

## Progress Tracking
### Completed
1. Fixed inventory updates for sale operations:
   - Added explicit inventory deduction in create_sale
   - Added explicit inventory addition in delete_sale
   - Improved transaction handling and error reporting
2. Added number of bags column to sales page:
   - Added column to table
   - Updated translations
   - Improved layout
3. Enhanced sale detail popup:
   - Added more transaction details
   - Fixed close button translation
   - Improved layout with sections
   - Added transport and tax information
4. Fixed purchase print page:
   - Updated grain name display
   - Fixed description of goods showing NA
5. Added Hindi translations:
   - Added missing purchase page translations
   - Added payment status translations
   - Improved consistency in translations

### In Progress
- None

### Up Next
- None - All tasks completed!
