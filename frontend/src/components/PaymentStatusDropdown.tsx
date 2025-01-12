import React, { useState } from 'react';
import {
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel
} from '@mui/material';
import { formatCurrency } from '../utils/formatters';

interface PaymentStatusDropdownProps {
    purchaseId: number;
    currentStatus: string;
    totalAmount: number;
    paidAmount: number;
    onStatusChange: (status: string, amount?: number, description?: string) => Promise<void>;
    mode?: 'status_change' | 'payment';
}

export const PaymentStatusDropdown: React.FC<PaymentStatusDropdownProps> = ({
    purchaseId,
    currentStatus,
    totalAmount,
    paidAmount,
    onStatusChange,
    mode = 'status_change'
}) => {
    const [status, setStatus] = useState(currentStatus);
    const [openDialog, setOpenDialog] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const remainingAmount = totalAmount - paidAmount;

    const validateAmount = (inputAmount: number) => {
        if (!inputAmount || inputAmount <= 0) {
            throw new Error('Please enter a valid amount');
        }
        if (inputAmount > remainingAmount) {
            throw new Error(`Cannot pay more than remaining amount: ${formatCurrency(remainingAmount)}`);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus) return;

        if (newStatus === 'partially_paid') {
            setStatus(newStatus);
            setOpenDialog(true);
        } else if (newStatus === 'paid') {
            await onStatusChange(newStatus);
        } else {
            await onStatusChange(newStatus);
        }
    };

    const handleSubmitPayment = async () => {
        try {
            const paymentAmount = parseFloat(amount);
            validateAmount(paymentAmount);
            await onStatusChange(status, paymentAmount, description);
            setOpenDialog(false);
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid payment');
        }
    };

    const resetForm = () => {
        setAmount('');
        setDescription('');
        setError('');
    };

    return (
        <>
            <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    label="Payment Status"
                >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="partially_paid">Partially Paid</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                </Select>
            </FormControl>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Enter Payment Details</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Amount"
                        type="number"
                        fullWidth
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        error={!!error}
                        helperText={error || `Remaining: ${formatCurrency(remainingAmount)}`}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmitPayment} variant="contained">
                        Submit Payment
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}; 