# Issue Fix Plan

## 1. Inventory Update After Sale Operations 
- [x] Check sale deletion endpoint in backend
- [x] Add inventory update logic after sale deletion
- [x] Verify inventory updates after sale creation/deletion

## 2. Add Number of Bags Column to Sales Page
- [ ] Update Sales page component to include number of bags column
- [ ] Add translation keys for the new column
- [ ] Ensure proper alignment and formatting

## 3. Enhance Sale Detail Popup
- [ ] Add more transaction details to the popup
- [ ] Fix close button translation
- [ ] Improve layout and formatting

## 4. Fix Purchase Print Page
- [ ] Update description of goods to show grain name
- [ ] Verify other print details are correct

## 5. Hindi Translation Issues
- [ ] Add missing Hindi translations for purchase page columns
- [ ] Test language switching
- [ ] Verify all translations

## Progress Tracking
### Completed
1. Fixed inventory updates for sale operations:
   - Added explicit inventory deduction in create_sale
   - Added explicit inventory addition in delete_sale
   - Improved transaction handling and error reporting

### In Progress
- Adding number of bags column to sales page

### Up Next
1. Enhance sale detail popup
2. Fix purchase print description
3. Add Hindi translations
