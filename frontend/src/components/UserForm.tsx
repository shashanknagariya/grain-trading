// Update the role options to match backend expectations
const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' }
];

// Make sure the role field is properly set
const payload = {
  username: formData.username,
  email: formData.email,
  password: formData.password,
  role: formData.role, // Ensure this matches one of the values above
  permissions: selectedPermissions
};

// Make sure the form submission is handling the role correctly
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setLoading(true);
    
    // Validate form
    if (!formData.username || !formData.email || !formData.password || !formData.role) {
      throw new Error('Please fill all required fields');
    }
    
    // Prepare payload
    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,  // Make sure this is one of: 'admin', 'manager', 'staff'
      permissions: selectedPermissions
    };
    
    console.log('Creating user with payload:', payload);
    
    // Send request
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create user');
    }
    
    onSubmit();
    handleClose();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
}; 